package db

import (
	"fmt"

	"imagine_backend/config"
	"imagine_backend/internal/models"
)

// Migrate creates the tenant schema, pins search_path, and AutoMigrates every
// model. Idempotent — safe to run on every server boot AND from cmd/migration.
// This is the ONLY place the migrated model list lives.
func Migrate() error {
	schema := config.AppConfig.DBSchema // ← DB_SCHEMA env var
	if schema == "" {
		return fmt.Errorf("DB_SCHEMA is required but empty — cannot migrate without a target schema")
	}
	if err := DB.Exec(fmt.Sprintf(`CREATE SCHEMA IF NOT EXISTS "%s"`, schema)).Error; err != nil {
		return fmt.Errorf("create schema %q: %w", schema, err)
	}
	if err := DB.Exec(fmt.Sprintf(`SET search_path TO "%s"`, schema)).Error; err != nil {
		return fmt.Errorf("set search_path %q: %w", schema, err)
	}
	return DB.AutoMigrate(
		&models.Payment{},
		&models.ContactMessage{},
		&models.Course{},
		&models.Setting{},
		&models.Coordinator{},
		&models.GalleryItem{},
	)
}
