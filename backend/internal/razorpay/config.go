package razorpay

import (
	"fmt"
	"os"
)

type Config struct {
	KeyID       string
	KeySecret   string
	Currency    string
	FrontendURL string
}

func LoadConfigFromEnv() (Config, error) {
	cfg := Config{
		KeyID:       os.Getenv("RAZORPAY_KEY_ID"),
		KeySecret:   os.Getenv("RAZORPAY_KEY_SECRET"),
		Currency:    os.Getenv("RAZORPAY_CURRENCY"),
		FrontendURL: os.Getenv("FRONTEND_URL"),
	}

	if cfg.Currency == "" {
		cfg.Currency = "INR"
	}

	if cfg.KeyID == "" {
		return Config{}, fmt.Errorf("razorpay: RAZORPAY_KEY_ID is required")
	}
	if cfg.KeySecret == "" {
		return Config{}, fmt.Errorf("razorpay: RAZORPAY_KEY_SECRET is required")
	}
	return cfg, nil
}
