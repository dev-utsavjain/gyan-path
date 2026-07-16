package v1

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"imagine_backend/config"
	"imagine_backend/internal/db"
	"imagine_backend/internal/mail"
	"imagine_backend/internal/models"

	"github.com/gin-gonic/gin"
)

// contactRequest is what the public "Contact Us" form submits.
type contactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Message string `json:"message"`
}

// SubmitContact handles POST /v1/contact. It stores the message and emails the
// app owner (best-effort). Email failures never fail the request — the message
// is already persisted and visible in the admin dashboard.
func SubmitContact(c *gin.Context) {
	var req contactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Phone = strings.TrimSpace(req.Phone)
	req.Message = strings.TrimSpace(req.Message)

	if req.Name == "" || req.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name and message are required"})
		return
	}
	if req.Email == "" && req.Phone == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "please provide an email or phone number"})
		return
	}

	row := models.ContactMessage{
		Name:    req.Name,
		Email:   req.Email,
		Phone:   req.Phone,
		Message: req.Message,
	}
	if err := db.DB.Create(&row).Error; err != nil {
		log.Printf("contact: persist message failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not record your message"})
		return
	}

	// Best-effort owner notification; must not affect the response.
	go notifyOwnerOfContact(row)

	c.JSON(http.StatusOK, gin.H{"received": true})
}

func notifyOwnerOfContact(m models.ContactMessage) {
	if !mail.Enabled() {
		return
	}
	owner := config.AppConfig.AppOwnerEmail
	if owner == "" {
		return
	}
	subject, body, err := mail.ContactMessageToOwner(m, config.AppConfig.AdminDashboardURL)
	if err != nil {
		log.Printf("contact: build owner email failed (id %d): %v", m.ID, err)
		return
	}
	if err := mail.Send([]string{owner}, subject, body); err != nil {
		log.Printf("contact: owner notification email failed (id %d): %v", m.ID, err)
	}
}

// ListContacts handles GET /v1/admin/contacts — newest first, with simple paging.
func ListContacts(c *gin.Context) {
	q := db.DB.Model(&models.ContactMessage{})

	if h := c.Query("handled"); h == "true" || h == "false" {
		q = q.Where("handled = ?", h == "true")
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

	var messages []models.ContactMessage
	if err := q.Order("created_at DESC").Limit(limit).Offset(offset).Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load messages"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"messages": messages,
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}

type markContactRequest struct {
	Handled bool `json:"handled"`
}

// MarkContactHandled handles POST /v1/admin/contacts/:id/handled — toggles the
// "handled" flag so admins can track which messages they have dealt with.
func MarkContactHandled(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid message id"})
		return
	}

	var req markContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	res := db.DB.Model(&models.ContactMessage{}).Where("id = ?", id).Update("handled", req.Handled)
	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update message"})
		return
	}
	if res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "message not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": id, "handled": req.Handled})
}
