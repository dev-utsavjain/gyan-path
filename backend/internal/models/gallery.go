package models

import "time"

const (
	GalleryTypeImage = "image"
	GalleryTypeVideo = "video"
)

const (
	GalleryStatusActive = "active" // shown on the public Gallery page
	GalleryStatusHidden = "hidden" // kept in admin only
)

// GalleryItem is one photo or video shown on the public Gallery page. URL is
// either a link the admin pasted or the object-storage (Cloudinary) URL of a
// file they uploaded — both cases collapse to a URL, so there is one column and
// no bytes in this database.
type GalleryItem struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Type string `gorm:"not null;index;default:'image'" json:"type"`
	URL  string `gorm:"not null" json:"url"`
	// Poster frame for videos. Optional: Cloudinary videos get one derived
	// client-side, pasted links may supply their own.
	ThumbnailURL string `json:"thumbnail_url"`
	Caption      string `json:"caption"`
	// Set only for uploaded files — lets a delete also remove the stored object
	// instead of orphaning it. Empty for pasted links.
	PublicID string `json:"public_id,omitempty"`
	// Featured items are the ones the homepage's horizontal strip pulls from.
	Featured  bool   `gorm:"not null;default:false;index" json:"featured"`
	Status    string `gorm:"not null;default:'active';index" json:"status"`
	SortOrder int    `gorm:"not null;default:0;index" json:"sort_order"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
