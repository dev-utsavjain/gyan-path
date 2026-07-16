package server

import (
	"context"
	"errors"
	"imagine_backend/config"
	webserver "imagine_backend/internal"
	"imagine_backend/internal/db"
	"imagine_backend/internal/mail"
	"imagine_backend/internal/middleware"
	"imagine_backend/internal/payment"
	"imagine_backend/internal/seed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

func StartServer() {
	config.LoadConfig()
	db.ConnectToDB()

	// The platform runs ONLY this binary on deploy — cmd/migration is NOT run.
	// Migrate at boot or the first table access crash-loops the process → 502.
	if err := db.Migrate(); err != nil {
		log.Fatalf("migrate: %v", err)
	}
	// Idempotent, AFTER migrate.
	seed.Run(db.DB)

	mail.Init()
	payment.Init()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	server := createServer()

	if err := runServer(ctx, server, 5*time.Second); err != nil {
		log.Fatal(err)
	}
}

func createServer() *http.Server {
	r := gin.New()

	r.Use(middleware.CORSMiddleware())

	r.OPTIONS("/*path", func(c *gin.Context) {
		c.AbortWithStatus(http.StatusNoContent)
	})

	r.Use(
		gin.Logger(),
		gin.Recovery(),
		middleware.IPLoggingMiddleware(),
		middleware.ErrorHandlingMiddleware(),
		middleware.RateLimiterMiddleware(),
	)

	assetsFS := getFileSystem(false)
	r.GET("/assets/*filepath", func(c *gin.Context) {
		file := strings.TrimPrefix(c.Param("filepath"), "/")

		f, err := assetsFS.Open("assets/" + file)
		if err != nil {
			c.Status(http.StatusNotFound)
			return
		}
		defer f.Close()

		stat, _ := f.Stat()
		http.ServeContent(c.Writer, c.Request, file, stat.ModTime(), f)
	})

	r.NoRoute(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/api/") {
			c.JSON(http.StatusNotFound, gin.H{"error": "API not found"})
			return
		}

		f, err := assetsFS.Open("index.html")
		if err != nil {
			c.String(http.StatusInternalServerError, "index.html not found")
			return
		}
		defer f.Close()

		stat, _ := f.Stat()
		http.ServeContent(c.Writer, c.Request, "index.html", stat.ModTime(), f)
	})

	RegisterRoutes(r)

	server := &http.Server{
		Addr:    ":" + config.AppConfig.Port,
		Handler: r,
	}

	return server
}

func runServer(
	ctx context.Context,
	server *http.Server,
	shutdownTimeOut time.Duration,
) error {
	errCh := make(chan error, 1)
	go func() {
		log.Println("Server running on :" + config.AppConfig.Port)
		if err := server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
		close(errCh)
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-errCh:
		return err
	case <-stop:
		log.Printf("Received shutdown signal")
	case <-ctx.Done():
		log.Printf("Context canceled, shutting down")
	}

	shutDownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeOut)
	defer cancel()

	if err := server.Shutdown(shutDownCtx); err != nil {
		if closeErr := server.Close(); closeErr != nil {
			return errors.Join(err, closeErr)
		}
		return err
	}

	log.Println("Server stopped gracefully")
	return nil
}

func getFileSystem(useOS bool) http.FileSystem {
	if useOS {
		return http.FS(os.DirFS("dist"))
	}
	fsys, err := fs.Sub(webserver.DistFolder, "dist")
	if err != nil {
		panic(err)
	}
	return http.FS(fsys)
}
