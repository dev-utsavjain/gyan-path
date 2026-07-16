package v1

import (
	"net/http"

	imagine "github.com/imagineBo/imagine-rag"
	"github.com/gin-gonic/gin"
)

type queryRequest struct {
	Message   string            `json:"message"`
	KBID      string            `json:"kb_id"`
	SessionID string            `json:"session_id"`
	History   []imagine.Message `json:"history"`
}

// Query handles POST /v1/query.
// NOTE: RAG backend (imagine_backend/internal/rag) is currently unavailable; stubbed out.
func Query(c *gin.Context) {
	c.JSON(http.StatusServiceUnavailable, gin.H{"error": "RAG not configured"})
}
