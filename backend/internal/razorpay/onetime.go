package razorpay

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
)

// CreateOrder creates a one-time Razorpay order. The returned order id is what
// the frontend opens Checkout with.
func (c *Client) CreateOrder(ctx context.Context, req OrderRequest) (*Order, error) {
	currency := req.Currency
	if currency == "" {
		currency = c.cfg.Currency
	}

	receipt := req.Receipt
	if receipt == "" {
		receipt = fmt.Sprintf("rcpt_%d", time.Now().UTC().Unix())
	}

	data := map[string]interface{}{
		"amount":   toSmallestUnit(req.Amount, currency),
		"currency": currency,
		"receipt":  receipt,
		"notes":    toNotes(req.Notes),
	}

	raw, err := c.api.Order.Create(data, nil)
	if err != nil {
		return nil, fmt.Errorf("razorpay: create order: %w", err)
	}

	order, err := decodeOrder(raw)
	if err != nil {
		return nil, err
	}

	if err := c.hooks.OnOrderCreated(ctx, OrderCreated{
		OrderID:  order.ID,
		Amount:   req.Amount,
		Currency: currency,
		Notes:    req.Notes,
	}); err != nil {
		return nil, fmt.Errorf("razorpay: OnOrderCreated hook: %w", err)
	}

	return order, nil
}

func decodeOrder(raw map[string]interface{}) (*Order, error) {
	o := &Order{}
	if err := remarshal(raw, o); err != nil {
		return nil, err
	}
	return o, nil
}

func remarshal(raw map[string]interface{}, out interface{}) error {
	b, err := json.Marshal(raw)
	if err != nil {
		return fmt.Errorf("razorpay: marshal response: %w", err)
	}
	if err := json.Unmarshal(b, out); err != nil {
		return fmt.Errorf("razorpay: decode response: %w", err)
	}
	return nil
}

func toNotes(notes map[string]string) map[string]interface{} {
	out := make(map[string]interface{}, len(notes))
	for k, v := range notes {
		out[k] = v
	}
	return out
}
