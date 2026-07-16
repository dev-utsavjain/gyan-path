package razorpay

import "context"

// Hooks is the integration point the package calls when creating an order, so
// the application can persist a pending record. One-time payment fulfilment is
// handled by the application's verify handler (manual mode), not via hooks.
type Hooks interface {
	OnOrderCreated(ctx context.Context, e OrderCreated) error
}

type OrderCreated struct {
	OrderID  string
	Amount   int64
	Currency string
	Notes    map[string]string
}

// NoopHooks implements Hooks with no-ops. Embed it and override only what you
// need.
type NoopHooks struct{}

func (NoopHooks) OnOrderCreated(context.Context, OrderCreated) error { return nil }
