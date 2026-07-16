package razorpay

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func (c *Client) VerifyPaymentSignature(orderID, paymentID, signature string) error {
	if hmacEqualHex(c.cfg.KeySecret, orderID+"|"+paymentID, signature) {
		return nil
	}
	return ErrInvalidSignature
}

// FetchPayment retrieves a payment from the Razorpay API. Manual verification
// uses it to confirm a payment was actually captured (status == "captured")
// instead of trusting a webhook to report fulfilment.
func (c *Client) FetchPayment(paymentID string) (*Payment, error) {
	raw, err := c.api.Payment.Fetch(paymentID, nil, nil)
	if err != nil {
		return nil, fmt.Errorf("razorpay: fetch payment %s: %w", paymentID, err)
	}
	p := &Payment{}
	if err := remarshal(raw, p); err != nil {
		return nil, err
	}
	return p, nil
}

func hmacEqualHex(secret, message, signature string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(message))
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}
