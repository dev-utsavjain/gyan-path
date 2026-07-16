package v1

import (
	"crypto/subtle"
	"net/http"
	"strconv"
	"strings"
	"time"

	"imagine_backend/config"
	"imagine_backend/internal/db"
	"imagine_backend/internal/mail"
	"imagine_backend/internal/models"
	"imagine_backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type adminLoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func AdminLogin(c *gin.Context) {
	var req adminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	userOK := subtle.ConstantTimeCompare([]byte(req.Username), []byte(config.AppConfig.AdminUsername)) == 1
	passOK := subtle.ConstantTimeCompare([]byte(req.Password), []byte(config.AppConfig.AdminPassword)) == 1
	if !userOK || !passOK {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid username or password"})
		return
	}

	token, err := utils.GenerateJWTWithRole(0, req.Username, "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not issue token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token, "username": req.Username})
}

func ListPayments(c *gin.Context) {
	q := db.DB.Model(&models.Payment{})

	if status := c.Query("status"); status != "" {
		q = q.Where("status = ?", status)
	}

	limit := 100
	if l := c.Query("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 && n <= 500 {
			limit = n
		}
	}
	offset := 0
	if o := c.Query("offset"); o != "" {
		if n, err := strconv.Atoi(o); err == nil && n >= 0 {
			offset = n
		}
	}

	var total int64
	q.Count(&total)

	var payments []models.Payment
	if err := q.Order("created_at DESC").Limit(limit).Offset(offset).Find(&payments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load payments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"payments": payments,
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}

type sendMeetRequest struct {
	MeetLink string `json:"meet_link"`
	Message  string `json:"message"`
	When     string `json:"when"`
}

func SendMeetLink(c *gin.Context) {
	if !mail.Enabled() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Email is not configured on the server"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payment id"})
		return
	}

	var req sendMeetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.MeetLink = strings.TrimSpace(req.MeetLink)
	if req.MeetLink == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "meet_link is required"})
		return
	}

	var p models.Payment
	if err := db.DB.First(&p, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}
	if strings.TrimSpace(p.Email) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "this student has no email on record"})
		return
	}

	subject, body, err := mail.MeetLinkToUser(p, req.MeetLink, req.Message, req.When)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not build email"})
		return
	}
	if err := mail.Send([]string{p.Email}, subject, body); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "could not send email: " + err.Error()})
		return
	}

	now := time.Now()
	db.DB.Model(&p).Updates(map[string]interface{}{
		"meet_link":          req.MeetLink,
		"meet_email_sent_at": &now,
	})

	c.JSON(http.StatusOK, gin.H{"sent": true, "to": p.Email})
}

func PaymentStats(c *gin.Context) {
	type row struct {
		Status string
		Count  int64
		Sum    int64
	}
	var rows []row
	db.DB.Model(&models.Payment{}).
		Select("status, COUNT(*) as count, COALESCE(SUM(amount),0) as sum").
		Group("status").
		Scan(&rows)

	stats := gin.H{
		"total_orders":   int64(0),
		"paid_orders":    int64(0),
		"pending_orders": int64(0),
		"failed_orders":  int64(0),
		"revenue":        int64(0),
	}
	for _, r := range rows {
		stats["total_orders"] = stats["total_orders"].(int64) + r.Count
		switch r.Status {
		case models.PaymentStatusPaid:
			stats["paid_orders"] = r.Count
			stats["revenue"] = r.Sum
		case models.PaymentStatusPending:
			stats["pending_orders"] = r.Count
		case models.PaymentStatusFailed:
			stats["failed_orders"] = r.Count
		}
	}

	c.JSON(http.StatusOK, stats)
}
