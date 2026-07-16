package razorpay

import (
	"errors"

	rzp "github.com/razorpay/razorpay-go"
)

var ErrInvalidSignature = errors.New("razorpay: invalid signature")

type Client struct {
	cfg   Config
	api   *rzp.Client
	hooks Hooks
}

func New(cfg Config, hooks Hooks) *Client {
	if hooks == nil {
		hooks = NoopHooks{}
	}
	return &Client{
		cfg:   cfg,
		api:   rzp.NewClient(cfg.KeyID, cfg.KeySecret),
		hooks: hooks,
	}
}

func (c *Client) KeyID() string { return c.cfg.KeyID }
