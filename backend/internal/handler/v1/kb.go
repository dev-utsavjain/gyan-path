package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ListKBs handles GET /v1/kb
// NOTE: RAG backend (imagine_backend/internal/rag) is currently unavailable; stubbed out.
func ListKBs(c *gin.Context) {
	c.JSON(http.StatusServiceUnavailable, gin.H{"error": "RAG not configured"})
}
