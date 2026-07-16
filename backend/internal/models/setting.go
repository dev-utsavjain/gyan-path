package models

import "time"

// Setting is a single editable site-configuration value, stored as a string
// keyed by a stable name (e.g. "contact_phone", "hero_title", "plan_basic_price").
// The public site reads all settings as a map; admins update them in bulk.
type Setting struct {
	Key       string    `gorm:"primaryKey" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}
