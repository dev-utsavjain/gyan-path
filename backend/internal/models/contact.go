package models

import "time"

// ContactMessage is a submission from the public "Contact Us" form. The owner
// is notified by email when one arrives, and admins can review them in the
// dashboard.
type ContactMessage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Email     string    `gorm:"index" json:"email"`
	Phone     string    `json:"phone"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	Handled   bool      `gorm:"not null;default:false;index" json:"handled"`
	CreatedAt time.Time `json:"created_at"`
}
