package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                  string
	Env                   string
	DBUser                string
	DBPassword            string
	DBName                string
	DBHost                string
	DBPort                string
	DBSchema              string
	JWTSecret             string
	RAGBaseURL            string
	RAGAPIKey             string
	RazorpayKeyID     string
	RazorpayKeySecret string
	RazorpayCurrency  string
	FrontendURL           string
	AdminUsername         string
	AdminPassword         string

	// SMTP / email
	SMTPHost          string
	SMTPPort          string
	SMTPUsername      string
	SMTPPassword      string
	SMTPFrom          string
	SMTPFromName      string
	AppName           string
	AppOwnerEmail     string
	AdminDashboardURL string
}

var AppConfig *Config

func LoadConfig() {
	godotenv.Load()

	env := os.Getenv("ENV")
	fmt.Printf("env: %s\n", env)
	if env == "" {
		env = "development"
	} else {
		godotenv.Overload(".env." + env)
	}

	AppConfig = &Config{
		Port:                  os.Getenv("PORT"),
		Env:                   os.Getenv("ENV"),
		DBUser:                os.Getenv("DB_USER"),
		DBPassword:            os.Getenv("DB_PASSWORD"),
		DBName:                os.Getenv("DB_NAME"),
		DBHost:                os.Getenv("DB_HOST"),
		DBPort:                os.Getenv("DB_PORT"),
		DBSchema:              os.Getenv("DB_SCHEMA"),
		JWTSecret:             os.Getenv("JWT_SECRET"),
		RAGBaseURL:            os.Getenv("RAG_BASE_URL"),
		RAGAPIKey:             os.Getenv("RAG_API_KEY"),
		RazorpayKeyID:     os.Getenv("RAZORPAY_KEY_ID"),
		RazorpayKeySecret: os.Getenv("RAZORPAY_KEY_SECRET"),
		RazorpayCurrency:  os.Getenv("RAZORPAY_CURRENCY"),
		FrontendURL:           os.Getenv("FRONTEND_URL"),
		AdminUsername:         os.Getenv("ADMIN_USERNAME"),
		AdminPassword:         os.Getenv("ADMIN_PASSWORD"),

		SMTPHost:          os.Getenv("SMTP_HOST"),
		SMTPPort:          os.Getenv("SMTP_PORT"),
		SMTPUsername:      os.Getenv("SMTP_USERNAME"),
		SMTPPassword:      os.Getenv("SMTP_PASSWORD"),
		SMTPFrom:          os.Getenv("SMTP_FROM"),
		SMTPFromName:      os.Getenv("SMTP_FROM_NAME"),
		AppName:           os.Getenv("APP_NAME"),
		AppOwnerEmail:     os.Getenv("APP_OWNER_EMAIL"),
		AdminDashboardURL: os.Getenv("ADMIN_DASHBOARD_URL"),
	}
	if AppConfig.JWTSecret == "" {
		AppConfig.JWTSecret = "your-very-secret-key"
	}
	if AppConfig.Port == "" {
		AppConfig.Port = "8080"
	}
	if AppConfig.RazorpayCurrency == "" {
		AppConfig.RazorpayCurrency = "INR"
	}
	if AppConfig.AdminUsername == "" {
		AppConfig.AdminUsername = "admin"
	}
	if AppConfig.AdminPassword == "" {
		AppConfig.AdminPassword = "admin123"
	}
	if AppConfig.SMTPPort == "" {
		AppConfig.SMTPPort = "587"
	}
	if AppConfig.AppName == "" {
		AppConfig.AppName = "Gyaanpath Digital"
	}
	if AppConfig.SMTPFromName == "" {
		AppConfig.SMTPFromName = AppConfig.AppName
	}
	// Default the admin dashboard link to the frontend's /admin page.
	if AppConfig.AdminDashboardURL == "" && AppConfig.FrontendURL != "" {
		AppConfig.AdminDashboardURL = strings.TrimRight(AppConfig.FrontendURL, "/") + "/admin"
	}
}
