package models

import "time"

// Course categories — which section of the site a course appears in.
const (
	CourseCategoryBasic      = "basic"              // "Basic Plan" group (enrolls the basic plan)
	CourseCategoryAdditional = "additional_support" // "Additional Support" group
	CourseCategoryPremium    = "premium"            // "Premium Special Courses" (own price)
	CourseCategoryUpcoming   = "upcoming"           // "Upcoming Courses" (shown as Coming Soon)
)

const (
	CourseStatusActive = "active" // shown on the public site
	CourseStatusHidden = "hidden" // kept in admin, not shown publicly
)

// Course is an admin-managed catalogue entry rendered on the homepage. Moving
// these out of the frontend code lets admins add, edit, delete, and "unlock"
// (recategorise from upcoming → basic/premium) courses without a redeploy.
type Course struct {
	ID          uint     `gorm:"primaryKey" json:"id"`
	Title       string   `gorm:"not null" json:"title"`
	Description string   `gorm:"type:text" json:"description"`
	ImageURL    string   `json:"image_url"`
	Category    string   `gorm:"not null;index;default:'basic'" json:"category"`
	Price       int64    `gorm:"not null;default:0" json:"price"` // rupees; used for premium courses
	Features    []string `gorm:"serializer:json" json:"features"`  // bullet points (premium)
	Status      string   `gorm:"not null;default:'active';index" json:"status"`
	SortOrder   int      `gorm:"not null;default:0;index" json:"sort_order"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
