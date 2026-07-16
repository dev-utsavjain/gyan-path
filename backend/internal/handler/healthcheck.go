package handler

import (
	"time"

	"github.com/gin-gonic/gin"
)

type HealthCheckResponse struct {
	Status  string    `json:"status"`
	Time    time.Time `json:"time"`
	Message string    `json:"message"`
}

func HealthCheck(c *gin.Context) {
	HealthCheckResponse := HealthCheckResponse{
		Status:  "ok",
		Time:    time.Now(),
		Message: "Server is healthy",
	}
	c.JSON(200, HealthCheckResponse)
}
