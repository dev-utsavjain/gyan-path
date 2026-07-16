package db

import (
	"fmt"
	"imagine_backend/config"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectToDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s search_path=%s sslmode=disable TimeZone=Asia/Kolkata",
		config.AppConfig.DBHost, config.AppConfig.DBUser, config.AppConfig.DBPassword, config.AppConfig.DBName, config.AppConfig.DBPort, config.AppConfig.DBSchema,
	)
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to get sql.DB: %v", err)
	}
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetConnMaxLifetime(time.Hour)
	sqlDB.SetConnMaxIdleTime(10 * time.Minute)
}
