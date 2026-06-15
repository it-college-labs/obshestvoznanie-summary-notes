package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/nksv-ilya/neuroarchive/internal/api"
	"github.com/nksv-ilya/neuroarchive/internal/auth"
	"github.com/nksv-ilya/neuroarchive/internal/config"
	"github.com/nksv-ilya/neuroarchive/internal/store"
	"github.com/nksv-ilya/neuroarchive/internal/upload"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	st, err := store.New(cfg.DatabaseURL)
	if err != nil {
		slog.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer st.Close()

	if err := st.Migrate(); err != nil {
		slog.Error("failed to migrate database", "error", err)
		os.Exit(1)
	}

	au, err := auth.New(cfg.AdminPasswordHash, cfg.JWTSecret, cfg.SecureCookie, "")
	if err != nil {
		slog.Error("failed to init auth", "error", err)
		os.Exit(1)
	}

	up := upload.New(cfg.UploadDir, cfg.BaseURL)

	server := api.New(st, au, up, cfg.BaseURL)

	addr := ":" + cfg.Port
	slog.Info("starting server", "addr", addr, "domain", cfg.AppDomain)
	if err := http.ListenAndServe(addr, server.Router()); err != nil {
		slog.Error("server error", "error", err)
		os.Exit(1)
	}
}
