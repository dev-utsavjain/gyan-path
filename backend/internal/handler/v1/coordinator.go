package v1

import (
	"net/http"
	"strconv"
	"strings"

	"imagine_backend/internal/db"
	"imagine_backend/internal/models"

	"github.com/gin-gonic/gin"
)

// ListCoordinators handles GET /v1/coordinators — the active list the
// enrollment form's dropdown is built from.
func ListCoordinators(c *gin.Context) {
	var rows []models.Coordinator
	if err := db.DB.
		Where("active = ?", true).
		Order("name ASC, id ASC").
		Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load coordinators"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"coordinators": rows})
}

// ListAllCoordinators handles GET /v1/admin/coordinators — everything,
// including deactivated ones.
func ListAllCoordinators(c *gin.Context) {
	var rows []models.Coordinator
	if err := db.DB.Order("name ASC, id ASC").Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load coordinators"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"coordinators": rows})
}

type coordinatorRequest struct {
	Name   string `json:"name"`
	Code   string `json:"code"`
	Active *bool  `json:"active"`
}

func (r *coordinatorRequest) normalize() {
	r.Name = strings.TrimSpace(r.Name)
	// Codes are matched and reported by humans — keep one canonical casing.
	r.Code = strings.ToUpper(strings.TrimSpace(r.Code))
}

func (r *coordinatorRequest) validate() (string, bool) {
	if r.Name == "" {
		return "coordinator name is required", false
	}
	if r.Code == "" {
		return "coordinator code is required", false
	}
	return "", true
}

func (r *coordinatorRequest) isActive() bool {
	if r.Active == nil {
		return true
	}
	return *r.Active
}

// codeTaken reports whether another row already uses this code. excludeID 0
// means "checking a brand-new row".
func codeTaken(code string, excludeID uint) bool {
	q := db.DB.Model(&models.Coordinator{}).Where("code = ?", code)
	if excludeID != 0 {
		q = q.Where("id <> ?", excludeID)
	}
	var count int64
	q.Count(&count)
	return count > 0
}

// CreateCoordinator handles POST /v1/admin/coordinators.
func CreateCoordinator(c *gin.Context) {
	var req coordinatorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.normalize()
	if msg, ok := req.validate(); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": msg})
		return
	}
	if codeTaken(req.Code, 0) {
		c.JSON(http.StatusConflict, gin.H{"error": "that coordinator code is already in use"})
		return
	}

	row := models.Coordinator{Name: req.Name, Code: req.Code, Active: req.isActive()}
	if err := db.DB.Create(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create coordinator"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"coordinator": row})
}

// UpdateCoordinator handles PUT /v1/admin/coordinators/:id.
func UpdateCoordinator(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid coordinator id"})
		return
	}

	var row models.Coordinator
	if err := db.DB.First(&row, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "coordinator not found"})
		return
	}

	var req coordinatorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.normalize()
	if msg, ok := req.validate(); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": msg})
		return
	}
	if codeTaken(req.Code, row.ID) {
		c.JSON(http.StatusConflict, gin.H{"error": "that coordinator code is already in use"})
		return
	}

	if err := db.DB.Model(&row).
		Select("name", "code", "active").
		Updates(models.Coordinator{Name: req.Name, Code: req.Code, Active: req.isActive()}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update coordinator"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"coordinator": row})
}

// DeleteCoordinator handles DELETE /v1/admin/coordinators/:id. Past purchases
// keep the name and code they were made with, so removing a coordinator never
// rewrites history.
func DeleteCoordinator(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid coordinator id"})
		return
	}
	res := db.DB.Delete(&models.Coordinator{}, id)
	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete coordinator"})
		return
	}
	if res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "coordinator not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true, "id": id})
}
