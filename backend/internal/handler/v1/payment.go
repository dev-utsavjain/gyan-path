package v1

import (
	"log"
	"net/http"

	"imagine_backend/internal/db"
	"imagine_backend/internal/models"
	"imagine_backend/internal/payment"
	"imagine_backend/internal/razorpay"

	"github.com/gin-gonic/gin"
)

// createOrderRequest is what the enrollment form submits before opening the
// Razorpay checkout. The frontend supplies the course and price.
type createOrderRequest struct {
	CourseName      string `json:"course_name"`
	Amount          int64  `json:"amount"`
	StudentName     string `json:"student_name"`
	FatherName      string `json:"father_name"`
	Age             int    `json:"age"`
	Mobile          string `json:"mobile"`
	Email           string `json:"email"`
	Qualification   string `json:"qualification"`
	Address         string `json:"address"`
	CoordinatorName string `json:"coordinator_name"`
}

// CreatePaymentOrder handles POST /v1/payments/order. It creates a Razorpay
// order, stores a pending payment row capturing who is enrolling and for which
// course, and returns the order plus the public key id for Checkout.
func CreatePaymentOrder(c *gin.Context) {
	if payment.Client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Payments are not configured"})
		return
	}

	var req createOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}
	if req.Amount <= 0 || req.CourseName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "course_name and a positive amount are required"})
		return
	}

	order, err := payment.Client.CreateOrder(c.Request.Context(), razorpay.OrderRequest{
		Amount: req.Amount,
		Notes: map[string]string{
			"course":  req.CourseName,
			"student": req.StudentName,
			"mobile":  req.Mobile,
			"email":   req.Email,
		},
	})
	if err != nil {
		log.Printf("payment: create order failed: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "could not create payment order"})
		return
	}

	row := models.Payment{
		OrderID:         order.ID,
		CourseName:      req.CourseName,
		Amount:          req.Amount,
		Currency:        order.Currency,
		StudentName:     req.StudentName,
		FatherName:      req.FatherName,
		Age:             req.Age,
		Mobile:          req.Mobile,
		Email:           req.Email,
		Qualification:   req.Qualification,
		Address:         req.Address,
		CoordinatorName: req.CoordinatorName,
		Status:          models.PaymentStatusPending,
	}
	if err := db.DB.Create(&row).Error; err != nil {
		log.Printf("payment: persist pending order %s failed: %v", order.ID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not record order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"order":  order,
		"key_id": payment.Client.KeyID(),
	})
}

type verifyPaymentRequest struct {
	OrderID   string `json:"razorpay_order_id"`
	PaymentID string `json:"razorpay_payment_id"`
	Signature string `json:"razorpay_signature"`
}

// VerifyPayment handles POST /v1/payments/verify. This is the authoritative
// fulfilment step in manual mode (no webhook): it confirms the checkout
// signature is genuine, fetches the payment from Razorpay to confirm it was
// actually captured, then marks the order paid and triggers the notifications.
func VerifyPayment(c *gin.Context) {
	if payment.Client == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Payments are not configured"})
		return
	}

	var req verifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	// 1. The signature proves the (order, payment) pair came from Razorpay
	//    Checkout and was not tampered with by the browser.
	if err := payment.Client.VerifyPaymentSignature(req.OrderID, req.PaymentID, req.Signature); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "signature verification failed", "verified": false})
		return
	}

	// 2. Fetch the payment server-side to confirm money was actually captured
	//    and that it belongs to this order. Without a webhook this is what
	//    makes fulfilment trustworthy.
	pmt, err := payment.Client.FetchPayment(req.PaymentID)
	if err != nil {
		log.Printf("payment: fetch payment %s failed: %v", req.PaymentID, err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "could not confirm payment", "verified": false})
		return
	}
	if pmt.OrderID != req.OrderID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "payment does not belong to this order", "verified": false})
		return
	}
	if pmt.Status != "captured" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":    "payment not captured (status: " + pmt.Status + ")",
			"verified": false,
		})
		return
	}

	// 3. Fulfil: mark the order paid (idempotent) and send the emails.
	if _, err := payment.MarkOrderPaid(req.OrderID, req.PaymentID); err != nil {
		log.Printf("payment: fulfilment for order %s failed: %v", req.OrderID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not record payment", "verified": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"verified": true, "status": models.PaymentStatusPaid})
}

// GetPaymentStatus handles GET /v1/payments/:order_id — lets the frontend read
// the order's current status (marked paid by the verify step).
func GetPaymentStatus(c *gin.Context) {
	orderID := c.Param("order_id")
	var row models.Payment
	if err := db.DB.Where("order_id = ?", orderID).First(&row).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"order_id": row.OrderID,
		"status":   row.Status,
		"course":   row.CourseName,
		"amount":   row.Amount,
	})
}
