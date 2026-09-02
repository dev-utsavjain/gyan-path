package models

import "time"

// Coordinator is a field employee whose code a student picks while enrolling,
// so a purchase can be attributed back to the person who brought it in. Admins
// manage only the name and the code — everything else is derived.
type Coordinator struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	Name   string `gorm:"not null" json:"name"`
	Code   string `gorm:"uniqueIndex;not null" json:"code"`
	Active bool   `gorm:"not null;default:true;index" json:"active"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
