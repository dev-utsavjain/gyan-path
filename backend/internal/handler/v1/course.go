package v1

import (
	"net/http"
	"strconv"
	"strings"

	"imagine_backend/internal/db"
	"imagine_backend/internal/models"

	"github.com/gin-gonic/gin"
)

var validCategories = map[string]bool{
	models.CourseCategoryBasic:      true,
	models.CourseCategoryAdditional: true,
	models.CourseCategoryPremium:    true,
	models.CourseCategoryUpcoming:   true,
}

// ListCourses handles GET /v1/courses — public catalogue (active only),
// ordered for stable rendering by section.
func ListCourses(c *gin.Context) {
	var courses []models.Course
	if err := db.DB.
		Where("status = ?", models.CourseStatusActive).
		Order("category ASC, sort_order ASC, id ASC").
		Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load courses"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"courses": courses})
}

// ListAllCourses handles GET /v1/admin/courses — everything, including hidden.
func ListAllCourses(c *gin.Context) {
	var courses []models.Course
	if err := db.DB.Order("category ASC, sort_order ASC, id ASC").Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load courses"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"courses": courses})
}

type courseRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	ImageURL    string   `json:"image_url"`
	Category    string   `json:"category"`
	Price       int64    `json:"price"`
	Features    []string `json:"features"`
	Status      string   `json:"status"`
	SortOrder   int      `json:"sort_order"`
}

func (r *courseRequest) normalize() {
	r.Title = strings.TrimSpace(r.Title)
	r.Category = strings.TrimSpace(r.Category)
	r.Status = strings.TrimSpace(r.Status)
	if r.Status == "" {
		r.Status = models.CourseStatusActive
	}
}

func (r *courseRequest) validate() (string, bool) {
	if r.Title == "" {
		return "title is required", false
	}
	if !validCategories[r.Category] {
		return "invalid category", false
	}
	if r.Status != models.CourseStatusActive && r.Status != models.CourseStatusHidden {
		return "invalid status", false
	}
	if r.Price < 0 {
		return "price cannot be negative", false
	}
	return "", true
}

// CreateCourse handles POST /v1/admin/courses.
func CreateCourse(c *gin.Context) {
	var req courseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.normalize()
	if msg, ok := req.validate(); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": msg})
		return
	}

	course := models.Course{
		Title:       req.Title,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		Category:    req.Category,
		Price:       req.Price,
		Features:    req.Features,
		Status:      req.Status,
		SortOrder:   req.SortOrder,
	}
	if err := db.DB.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create course"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"course": course})
}

// UpdateCourse handles PUT /v1/admin/courses/:id. "Unlock" is simply moving a
// course from category "upcoming" to an active category via this endpoint.
func UpdateCourse(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course id"})
		return
	}

	var course models.Course
	if err := db.DB.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "course not found"})
		return
	}

	var req courseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.normalize()
	if msg, ok := req.validate(); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": msg})
		return
	}

	// Features is a serialized column; assign via Select to allow clearing it.
	updates := models.Course{
		Title:       req.Title,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		Category:    req.Category,
		Price:       req.Price,
		Features:    req.Features,
		Status:      req.Status,
		SortOrder:   req.SortOrder,
	}
	if err := db.DB.Model(&course).
		Select("title", "description", "image_url", "category", "price", "features", "status", "sort_order").
		Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update course"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"course": course})
}

// DeleteCourse handles DELETE /v1/admin/courses/:id.
func DeleteCourse(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course id"})
		return
	}
	res := db.DB.Delete(&models.Course{}, id)
	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete course"})
		return
	}
	if res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "course not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true, "id": id})
}
