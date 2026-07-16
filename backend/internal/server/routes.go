package server

import (
	"imagine_backend/internal/handler"
	v1 "imagine_backend/internal/handler/v1"
	"imagine_backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.GET("/health", handler.HealthCheck)
	}

	v1Group := api.Group("/v1")
	{
		v1Group.GET("/kb", v1.ListKBs)
		v1Group.POST("/sessions", v1.CreateSession)
		v1Group.GET("/sessions", v1.ListSessions)
		v1Group.GET("/sessions/:id", v1.GetSessionHistory)
		v1Group.POST("/query", v1.Query)
		v1Group.POST("/payments/order", v1.CreatePaymentOrder)
		v1Group.POST("/payments/verify", v1.VerifyPayment)
		v1Group.GET("/payments/:order_id", v1.GetPaymentStatus)
		v1Group.POST("/contact", v1.SubmitContact)
		v1Group.GET("/courses", v1.ListCourses)
		v1Group.GET("/settings", v1.GetSettings)
		v1Group.POST("/admin/login", v1.AdminLogin)
		admin := v1Group.Group("/admin")
		admin.Use(middleware.AdminAuthMiddleware())
		{
			admin.GET("/payments", v1.ListPayments)
			admin.GET("/stats", v1.PaymentStats)
			admin.POST("/payments/:id/send-meet", v1.SendMeetLink)
			admin.GET("/contacts", v1.ListContacts)
			admin.POST("/contacts/:id/handled", v1.MarkContactHandled)
			admin.GET("/courses", v1.ListAllCourses)
			admin.POST("/courses", v1.CreateCourse)
			admin.PUT("/courses/:id", v1.UpdateCourse)
			admin.DELETE("/courses/:id", v1.DeleteCourse)
			admin.PUT("/settings", v1.UpdateSettings)
		}
	}
}
