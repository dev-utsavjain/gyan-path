package models

import "time"

const (
	PaymentStatusPending = "pending"
	PaymentStatusPaid    = "paid"
	PaymentStatusFailed  = "failed"
)

type Payment struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	OrderID         string     `gorm:"uniqueIndex;not null" json:"order_id"`
	PaymentID       string     `gorm:"index" json:"payment_id"`
	CourseName      string     `gorm:"not null" json:"course_name"`
	Amount          int64      `gorm:"not null" json:"amount"`
	Currency        string     `gorm:"not null" json:"currency"`
	StudentName     string     `json:"student_name"`
	FatherName      string     `json:"father_name"`
	Age             int        `json:"age"`
	Mobile          string     `gorm:"index" json:"mobile"`
	Email           string     `gorm:"index" json:"email"`
	Qualification   string     `json:"qualification"`
	Address         string     `json:"address"`
	CoordinatorName string     `json:"coordinator_name"`
	CoordinatorCode string     `gorm:"index" json:"coordinator_code"`
	Status          string     `gorm:"not null;default:'pending';index" json:"status"`
	FailureReason   string     `json:"failure_reason,omitempty"`
	PaidAt          *time.Time `json:"paid_at,omitempty"`

	// Set when an admin emails the student a class / Google Meet link.
	MeetLink        string     `json:"meet_link,omitempty"`
	MeetEmailSentAt *time.Time `json:"meet_email_sent_at,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
