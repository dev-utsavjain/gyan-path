package payment

import (
	"log"
	"time"

	"imagine_backend/config"
	"imagine_backend/internal/db"
	"imagine_backend/internal/mail"
	"imagine_backend/internal/models"
	"imagine_backend/internal/razorpay"
)

// DBHooks satisfies razorpay.Hooks. Order creation is recorded directly by the
// handler and fulfilment happens in the verify handler (manual mode), so the
// no-op defaults from razorpay.NoopHooks are all that's needed here.
type DBHooks struct {
	razorpay.NoopHooks
}

// MarkOrderPaid promotes the matching pending row to "paid" and, on the first
// such transition, sends the notification emails. It is idempotent: calling it
// again for an already-paid order is a no-op and returns fulfilled=false.
//
// This is the authoritative fulfilment in manual verification mode — the
// /payments/verify handler calls it after confirming the payment was captured.
func MarkOrderPaid(orderID, paymentID string) (fulfilled bool, err error) {
	now := time.Now()
	res := db.DB.Model(&models.Payment{}).
		Where("order_id = ? AND status <> ?", orderID, models.PaymentStatusPaid).
		Updates(map[string]interface{}{
			"status":     models.PaymentStatusPaid,
			"payment_id": paymentID,
			"paid_at":    &now,
		})
	if res.Error != nil {
		return false, res.Error
	}
	if res.RowsAffected == 0 {
		log.Printf("payment: order %s already paid or unknown — fulfilment skipped", orderID)
		return false, nil
	}

	log.Printf("payment: order %s marked PAID (payment %s)", orderID, paymentID)

	// First (and only) transition to paid — send notification emails once.
	var row models.Payment
	if err := db.DB.Where("order_id = ?", orderID).First(&row).Error; err != nil {
		log.Printf("payment: could not load order %s for email: %v", orderID, err)
		return true, nil
	}
	// Best-effort; email failures must not undo a successful payment.
	go sendPaymentEmails(row)

	return true, nil
}

// sendPaymentEmails notifies the student (confirmation) and the app owner (new
// payment alert with admin link). Errors are logged, never surfaced.
func sendPaymentEmails(row models.Payment) {
	if !mail.Enabled() {
		return
	}

	if row.Email != "" {
		if subject, body, err := mail.PaymentReceivedToUser(row); err == nil {
			if err := mail.Send([]string{row.Email}, subject, body); err != nil {
				log.Printf("payment: user confirmation email failed (order %s): %v", row.OrderID, err)
			}
		}
	}

	if owner := config.AppConfig.AppOwnerEmail; owner != "" {
		if subject, body, err := mail.PaymentNotificationToOwner(row, config.AppConfig.AdminDashboardURL); err == nil {
			if err := mail.Send([]string{owner}, subject, body); err != nil {
				log.Printf("payment: owner notification email failed (order %s): %v", row.OrderID, err)
			}
		}
	}
}
