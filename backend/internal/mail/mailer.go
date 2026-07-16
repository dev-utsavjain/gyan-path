package mail

import (
	"fmt"
	"log"
	"net/smtp"
	"strings"

	"imagine_backend/config"
)

type settings struct {
	host, port, username, password, from, fromName string
}

var (
	cfg     settings
	enabled bool
)

// Init reads SMTP configuration. Call after config.LoadConfig.
func Init() {
	cfg = settings{
		host:     config.AppConfig.SMTPHost,
		port:     config.AppConfig.SMTPPort,
		username: config.AppConfig.SMTPUsername,
		password: config.AppConfig.SMTPPassword,
		from:     config.AppConfig.SMTPFrom,
		fromName: config.AppConfig.SMTPFromName,
	}
	if cfg.host == "" || cfg.from == "" {
		log.Println("mail: SMTP_HOST / SMTP_FROM not set — email sending disabled")
		return
	}
	enabled = true
	log.Printf("mail: SMTP enabled (host=%s from=%s)", cfg.host, cfg.from)
}

// Enabled reports whether email sending is configured.
func Enabled() bool { return enabled }

// Send delivers an HTML email to the given recipients.
func Send(to []string, subject, htmlBody string) error {
	if !enabled {
		return fmt.Errorf("mail: not configured")
	}
	recipients := make([]string, 0, len(to))
	for _, r := range to {
		if strings.TrimSpace(r) != "" {
			recipients = append(recipients, strings.TrimSpace(r))
		}
	}
	if len(recipients) == 0 {
		return fmt.Errorf("mail: no recipients")
	}

	from := cfg.from
	fromHeader := from
	if cfg.fromName != "" {
		fromHeader = fmt.Sprintf("%s <%s>", cfg.fromName, from)
	}

	var msg strings.Builder
	msg.WriteString("From: " + fromHeader + "\r\n")
	msg.WriteString("To: " + strings.Join(recipients, ", ") + "\r\n")
	msg.WriteString("Subject: " + subject + "\r\n")
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)

	addr := cfg.host + ":" + cfg.port
	var auth smtp.Auth
	if cfg.username != "" {
		auth = smtp.PlainAuth("", cfg.username, cfg.password, cfg.host)
	}

	if err := smtp.SendMail(addr, auth, from, recipients, []byte(msg.String())); err != nil {
		return fmt.Errorf("mail: send: %w", err)
	}
	return nil
}
