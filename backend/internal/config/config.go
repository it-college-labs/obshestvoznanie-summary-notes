package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	AppDomain         string
	AppEnv            string
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
		AppEnv:            os.Getenv("APP_ENV"),
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
	if cfg.AppEnv == "" {
		cfg.AppEnv = "development"
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
	if cfg.AdminPasswordHash == "change-me" {
		return nil, fmt.Errorf("ADMIN_PASSWORD_HASH must be changed")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}
	if cfg.JWTSecret == "change-me" || len(cfg.JWTSecret) < 32 {
		return nil, fmt.Errorf("JWT_SECRET must be at least 32 characters and not use the example value")
	}
	if cfg.UploadDir == "" {
		cfg.UploadDir = "/app/data/uploads"
	}
	if cfg.AppEnv == "production" && !cfg.SecureCookie {
		return nil, fmt.Errorf("SECURE_COOKIE must be true in production")
	}
	if cfg.AppEnv == "production" && strings.Contains(cfg.DatabaseURL, "neuro:neuro@") {
		return nil, fmt.Errorf("DATABASE_URL must not use development credentials in production")
	}

	return cfg, nil
}
