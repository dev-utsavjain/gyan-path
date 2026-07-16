package razorpay

type OrderRequest struct {
	Amount   int64             `json:"amount"`
	Currency string            `json:"currency"`
	Receipt  string            `json:"receipt"`
	Notes    map[string]string `json:"notes"`
}

type Order struct {
	ID         string `json:"id"`
	Amount     int64  `json:"amount"`
	AmountDue  int64  `json:"amount_due"`
	AmountPaid int64  `json:"amount_paid"`
	Currency   string `json:"currency"`
	Receipt    string `json:"receipt"`
	Status     string `json:"status"`
	CreatedAt  int64  `json:"created_at"`
}

// Payment is a fetched Razorpay payment, used by manual verification to confirm
// a payment was actually captured without relying on a webhook.
type Payment struct {
	ID       string `json:"id"`
	OrderID  string `json:"order_id"`
	Status   string `json:"status"`
	Amount   int64  `json:"amount"`
	Currency string `json:"currency"`
	Captured bool   `json:"captured"`
	Method   string `json:"method"`
	Email    string `json:"email"`
	Contact  string `json:"contact"`
}
