package v1

import (
	"net/http"
	"time"

	"imagine_backend/internal/db"
	"imagine_backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm/clause"
)

// GetSettings handles GET /v1/settings — returns all settings as a flat
// { key: value } map for the public site to consume.
func GetSettings(c *gin.Context) {
	var rows []models.Setting
	if err := db.DB.Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load settings"})
		return
	}
	out := make(map[string]string, len(rows))
	for _, r := range rows {
		out[r.Key] = r.Value
	}
	c.JSON(http.StatusOK, gin.H{"settings": out})
}

// UpdateSettings handles PUT /v1/admin/settings — bulk upsert of a
// { key: value } map. Unknown keys are accepted (forward-compatible with new
// frontend fields), so the frontend owns the schema.
func UpdateSettings(c *gin.Context) {
	var body map[string]string
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	if len(body) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no settings provided"})
		return
	}

	now := time.Now()
	rows := make([]models.Setting, 0, len(body))
	for k, v := range body {
		rows = append(rows, models.Setting{Key: k, Value: v, UpdatedAt: now})
	}

	if err := db.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "key"}},
		DoUpdates: clause.AssignmentColumns([]string{"value", "updated_at"}),
	}).Create(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"saved": len(rows)})
}
