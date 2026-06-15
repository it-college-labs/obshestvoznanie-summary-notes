package config

import (
	"fmt"
	"os"
)

type Config struct {
	AppDomain         string
	BaseURL           string
	DatabaseURL       string
	AdminPasswordHash string
	JWTSecret         string
	UploadDir         string
	SecureCookie      bool
	Port              string
}

func Load() (*Config, error) {
	secure := os.Getenv("SECURE_COOKIE") == "true" || os.Getenv("SECURE_COOKIE") == "1"
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	cfg := &Config{
		AppDomain:         os.Getenv("APP_DOMAIN"),
		BaseURL:           os.Getenv("BASE_URL"),
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		AdminPasswordHash: os.Getenv("ADMIN_PASSWORD_HASH"),
		JWTSecret:         os.Getenv("JWT_SECRET"),
		UploadDir:         os.Getenv("UPLOAD_DIR"),
		SecureCookie:      secure,
		Port:              port,
	}

	if cfg.AppDomain == "" {
		cfg.AppDomain = "localhost"
	}
	if cfg.BaseURL == "" {
		cfg.BaseURL = "http://localhost"
	}
	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.AdminPasswordHash == "" {
		return nil, fmt.Errorf("ADMIN_PASSWORD_HASH is required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}
	if cfg.UploadDir == "" {
		cfg.UploadDir = "/app/data/uploads"
	}

	return cfg, nil
}
