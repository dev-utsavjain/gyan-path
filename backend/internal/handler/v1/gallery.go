package v1

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"imagine_backend/internal/cloudinary"
	"imagine_backend/internal/db"
	"imagine_backend/internal/models"

	"github.com/gin-gonic/gin"
)

// ListGallery handles GET /v1/gallery — public media (active only).
// ?featured=true limits it to the items chosen for the homepage strip, and
// ?limit=n caps the result so the homepage doesn't pull the whole library.
func ListGallery(c *gin.Context) {
	q := db.DB.Model(&models.GalleryItem{}).Where("status = ?", models.GalleryStatusActive)

	if c.Query("featured") == "true" {
		q = q.Where("featured = ?", true)
	}

	// Newest first within a sort group, so recent uploads surface without the
	// admin having to renumber anything.
	q = q.Order("sort_order ASC, created_at DESC, id DESC")

	if l := c.Query("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 && n <= 200 {
			q = q.Limit(n)
		}
	}

	var items []models.GalleryItem
	if err := q.Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load gallery"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

// ListAllGallery handles GET /v1/admin/gallery — everything, including hidden.
func ListAllGallery(c *gin.Context) {
	var items []models.GalleryItem
	if err := db.DB.Order("sort_order ASC, created_at DESC, id DESC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load gallery"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

// GalleryUploadSignature handles GET /v1/admin/gallery/upload-signature. The
// browser posts the file straight to Cloudinary with this signature, so media
// bytes never travel through this server.
func GalleryUploadSignature(c *gin.Context) {
	sig, err := cloudinary.SignUpload()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "file uploads are not configured on the server — paste a media link instead",
		})
		return
	}
	c.JSON(http.StatusOK, sig)
}

type galleryRequest struct {
	Type         string `json:"type"`
	URL          string `json:"url"`
	ThumbnailURL string `json:"thumbnail_url"`
	Caption      string `json:"caption"`
	PublicID     string `json:"public_id"`
	Featured     *bool  `json:"featured"`
	Status       string `json:"status"`
	SortOrder    int    `json:"sort_order"`
}

func (r *galleryRequest) normalize() {
	r.Type = strings.ToLower(strings.TrimSpace(r.Type))
	r.URL = strings.TrimSpace(r.URL)
	r.ThumbnailURL = strings.TrimSpace(r.ThumbnailURL)
	r.Caption = strings.TrimSpace(r.Caption)
	r.PublicID = strings.TrimSpace(r.PublicID)
	r.Status = strings.TrimSpace(r.Status)
	if r.Type == "" {
		r.Type = models.GalleryTypeImage
	}
	if r.Status == "" {
		r.Status = models.GalleryStatusActive
	}
}

func (r *galleryRequest) validate() (string, bool) {
	if r.URL == "" {
		return "a media file or link is required", false
	}
	if !strings.HasPrefix(r.URL, "http://") && !strings.HasPrefix(r.URL, "https://") {
		return "media link must start with http:// or https://", false
	}
	if r.Type != models.GalleryTypeImage && r.Type != models.GalleryTypeVideo {
		return "type must be image or video", false
	}
	if r.Status != models.GalleryStatusActive && r.Status != models.GalleryStatusHidden {
		return "invalid status", false
	}
	return "", true
}

func (r *galleryRequest) isFeatured() bool {
	return r.Featured != nil && *r.Featured
}

// CreateGalleryItem handles POST /v1/admin/gallery. The row records where the
// media lives; the file itself is either already in object storage (uploaded)
// or hosted elsewhere (a pasted link).
func CreateGalleryItem(c *gin.Context) {
	var req galleryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.normalize()
	if msg, ok := req.validate(); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": msg})
		return
	}

	item := models.GalleryItem{
		Type:         req.Type,
		URL:          req.URL,
		ThumbnailURL: req.ThumbnailURL,
		Caption:      req.Caption,
		PublicID:     req.PublicID,
		Featured:     req.isFeatured(),
		Status:       req.Status,
		SortOrder:    req.SortOrder,
	}
	if err := db.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save media"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"item": item})
}

// UpdateGalleryItem handles PUT /v1/admin/gallery/:id — caption, ordering,
// featured flag and visibility. The stored file is never replaced in place;
// swapping media means deleting the item and adding a new one.
func UpdateGalleryItem(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid media id"})
		return
	}

	var item models.GalleryItem
	if err := db.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "media not found"})
		return
	}

	var req galleryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	req.normalize()
	if msg, ok := req.validate(); !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": msg})
		return
	}

	updates := models.GalleryItem{
		Type:         req.Type,
		URL:          req.URL,
		ThumbnailURL: req.ThumbnailURL,
		Caption:      req.Caption,
		Featured:     req.isFeatured(),
		Status:       req.Status,
		SortOrder:    req.SortOrder,
	}
	if err := db.DB.Model(&item).
		Select("type", "url", "thumbnail_url", "caption", "featured", "status", "sort_order").
		Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not update media"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"item": item})
}

// DeleteGalleryItem handles DELETE /v1/admin/gallery/:id. Uploaded files are
// also removed from object storage so deleted media doesn't accumulate there;
// that cleanup is best-effort and never blocks the delete.
func DeleteGalleryItem(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid media id"})
		return
	}

	var item models.GalleryItem
	if err := db.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "media not found"})
		return
	}

	if err := db.DB.Delete(&models.GalleryItem{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete media"})
		return
	}

	if item.PublicID != "" && cloudinary.Enabled() {
		go func(publicID, kind string) {
			if err := cloudinary.Destroy(publicID, kind); err != nil {
				log.Printf("gallery: could not remove stored file %s: %v", publicID, err)
			}
		}(item.PublicID, item.Type)
	}

	c.JSON(http.StatusOK, gin.H{"deleted": true, "id": id})
}
