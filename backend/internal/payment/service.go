// Package payment wires the reusable razorpay package (internal/razorpay) to
// this application's database and configuration. It owns the process-wide
// Razorpay client used by the payment HTTP handlers.
package payment

import (
	"log"

	"imagine_backend/config"
	"imagine_backend/internal/razorpay"
)

// Client is the shared Razorpay client. It is nil until Init runs successfully.
var Client *razorpay.Client

// Init builds the Razorpay client from configuration and the DB-backed hooks.
// It is a no-op (with a warning) when Razorpay credentials are absent so the
// rest of the server can still boot in environments without payments.
func Init() {
	cfg := razorpay.Config{
		KeyID:       config.AppConfig.RazorpayKeyID,
		KeySecret:   config.AppConfig.RazorpayKeySecret,
		Currency:    config.AppConfig.RazorpayCurrency,
		FrontendURL: config.AppConfig.FrontendURL,
	}

	if cfg.KeyID == "" || cfg.KeySecret == "" {
		log.Println("payment: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — payment endpoints disabled")
		return
	}

	Client = razorpay.New(cfg, DBHooks{})
	log.Println("payment: Razorpay client initialized")
}
