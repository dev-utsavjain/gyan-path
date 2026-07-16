package main

import (
	"log"

	"imagine_backend/config"
	"imagine_backend/internal/db"
	"imagine_backend/internal/seed"
)

func main() {
	config.LoadConfig()
	db.ConnectToDB()
	if err := db.Migrate(); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	// Populate courses + default settings (idempotent).
	seed.Run(db.DB)
	log.Println("Migrations completed successfully.")
}
