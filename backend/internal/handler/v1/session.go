package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// NOTE: RAG backend (imagine_backend/internal/rag) is currently unavailable; handlers stubbed out.

// CreateSession handles POST /v1/sessions
func CreateSession(c *gin.Context) {
	c.JSON(http.StatusServiceUnavailable, gin.H{"error": "RAG not configured"})
}

// ListSessions handles GET /v1/sessions?kb_id={id}
func ListSessions(c *gin.Context) {
	c.JSON(http.StatusServiceUnavailable, gin.H{"error": "RAG not configured"})
}

// GetSessionHistory handles GET /v1/sessions/:id
func GetSessionHistory(c *gin.Context) {
	c.JSON(http.StatusServiceUnavailable, gin.H{"error": "RAG not configured"})
}
