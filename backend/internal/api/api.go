package api

import (
	"encoding/json"
	"fmt"
	"io"
	"mime"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/nksv-ilya/neuroarchive/internal/auth"
	"github.com/nksv-ilya/neuroarchive/internal/models"
	"github.com/nksv-ilya/neuroarchive/internal/render"
	"github.com/nksv-ilya/neuroarchive/internal/store"
	"github.com/nksv-ilya/neuroarchive/internal/upload"
)

type Server struct {
	store  *store.Store
	auth   *auth.Auth
	upload *upload.Service
	router *chi.Mux
	baseURL string
}

func New(st *store.Store, au *auth.Auth, up *upload.Service, baseURL string) *Server {
	s := &Server{
		store:   st,
		auth:    au,
		upload:  up,
		baseURL: baseURL,
	}
	s.setupRoutes()
	return s
}

func (s *Server) Router() *chi.Mux {
	return s.router
}

func (s *Server) setupRoutes() {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://127.0.0.1:5173", s.baseURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Requested-With"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(jsonMiddleware)

	r.Get("/api/health", s.healthHandler)

	r.Get("/api/articles", s.listArticlesHandler)
	r.Get("/api/articles/{id}", s.getArticleHandler)

	r.Post("/api/admin/login", s.loginHandler)
	r.Post("/api/admin/logout", s.logoutHandler)

	r.Route("/api/admin", func(r chi.Router) {
		r.Use(s.auth.Middleware)
		r.Get("/me", s.adminMeHandler)
		r.Get("/articles", s.adminListArticlesHandler)
		r.Get("/articles/{id}", s.adminGetArticleHandler)
		r.Post("/articles", s.adminCreateArticleHandler)
		r.Put("/articles/{id}", s.adminUpdateArticleHandler)
		r.Delete("/articles/{id}", s.adminDeleteArticleHandler)
		r.Patch("/articles/{id}/publish", s.adminPublishArticleHandler)
		r.Post("/upload", s.adminUploadHandler)
		r.Get("/uploads", s.adminListUploadsHandler)
	})

	r.Get("/uploads/{filename}", s.serveUploadHandler)

	s.router = r
}

func jsonMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		next.ServeHTTP(w, r)
	})
}

func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) listArticlesHandler(w http.ResponseWriter, r *http.Request) {
	items, err := s.store.ListArticles(r.Context(), string(models.StatusPublished))
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, items)
}

func (s *Server) getArticleHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	article, err := s.store.GetArticle(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "article not found")
		return
	}
	if article.Status != string(models.StatusPublished) {
		respondError(w, http.StatusNotFound, "article not found")
		return
	}
	public, err := render.RenderArticle(article)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, public)
}

func (s *Server) adminMeHandler(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]bool{"authenticated": true})
}

func (s *Server) adminListArticlesHandler(w http.ResponseWriter, r *http.Request) {
	items, err := s.store.ListArticles(r.Context(), "")
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, items)
}

func (s *Server) adminGetArticleHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	article, err := s.store.GetArticle(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "article not found")
		return
	}
	respondJSON(w, http.StatusOK, article)
}

func (s *Server) adminCreateArticleHandler(w http.ResponseWriter, r *http.Request) {
	var article models.Article
	if err := json.NewDecoder(r.Body).Decode(&article); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	if err := validateArticle(&article); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	exists, err := s.store.ArticleExists(r.Context(), article.ID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if exists {
		respondError(w, http.StatusConflict, "article with this id already exists")
		return
	}
	now := time.Now()
	article.CreatedAt = now
	article.UpdatedAt = now
	if article.Status == "" {
		article.Status = string(models.StatusDraft)
	}
	if err := s.store.CreateArticle(r.Context(), &article); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, article)
}

func (s *Server) adminUpdateArticleHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var article models.Article
	if err := json.NewDecoder(r.Body).Decode(&article); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	article.ID = id
	if err := validateArticle(&article); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	article.UpdatedAt = time.Now()
	if err := s.store.UpdateArticle(r.Context(), &article); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, article)
}

func (s *Server) adminDeleteArticleHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := s.store.DeleteArticle(r.Context(), id); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"deleted": id})
}

func (s *Server) adminPublishArticleHandler(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	article, err := s.store.GetArticle(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "article not found")
		return
	}
	var status string
	if article.Status == string(models.StatusPublished) {
		status = string(models.StatusDraft)
	} else {
		status = string(models.StatusPublished)
	}
	if err := s.store.SetArticleStatus(r.Context(), id, status); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"status": status})
}

func (s *Server) adminUploadHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		respondError(w, http.StatusBadRequest, "invalid multipart form")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		respondError(w, http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()

	if seeker, ok := file.(io.ReadSeeker); ok {
		contentType := upload.SniffMimeType(seeker, header.Filename)
		if !upload.AllowedMimeType(contentType) {
			respondError(w, http.StatusBadRequest, "unsupported file type")
			return
		}
	}

	up := &models.Upload{
		Filename: header.Filename,
		MimeType: header.Header.Get("Content-Type"),
		CreatedAt: time.Now(),
	}
	filename, err := s.upload.Save(file, up)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	up.Path = filename
	if err := s.store.CreateUpload(r.Context(), up); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, map[string]string{
		"id":       up.ID,
		"filename": up.Filename,
		"url":      s.upload.URL(filename),
	})
}

func (s *Server) adminListUploadsHandler(w http.ResponseWriter, r *http.Request) {
	uploads, err := s.store.ListUploads(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	type uploadDTO struct {
		ID       string    `json:"id"`
		Filename string    `json:"filename"`
		URL      string    `json:"url"`
		MimeType string    `json:"mimeType"`
		CreatedAt time.Time `json:"createdAt"`
	}

	items := make([]uploadDTO, len(uploads))
	for i, u := range uploads {
		items[i] = uploadDTO{
			ID:       u.ID,
			Filename: u.Filename,
			URL:      s.upload.URL(u.Path),
			MimeType: u.MimeType,
			CreatedAt: u.CreatedAt,
		}
	}
	respondJSON(w, http.StatusOK, items)
}

func (s *Server) serveUploadHandler(w http.ResponseWriter, r *http.Request) {
	filename := chi.URLParam(r, "filename")
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") {
		http.NotFound(w, r)
		return
	}
	path := s.upload.LocalPath(filename)
	mimeType := mime.TypeByExtension(filepath.Ext(filename))
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}
	w.Header().Set("Content-Type", mimeType)
	http.ServeFile(w, r, path)
}

func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	if !s.auth.VerifyPassword(req.Password) {
		respondError(w, http.StatusUnauthorized, "invalid password")
		return
	}
	token, err := s.auth.GenerateToken()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	s.auth.SetCookie(w, token)
	respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) logoutHandler(w http.ResponseWriter, r *http.Request) {
	s.auth.ClearCookie(w)
	respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func validateArticle(a *models.Article) error {
	if a.ID == "" {
		return fmt.Errorf("id is required")
	}
	if a.Title == "" {
		return fmt.Errorf("title is required")
	}
	if a.Week == "" {
		return fmt.Errorf("week is required")
	}
	if a.Annotation == "" {
		return fmt.Errorf("annotation is required")
	}
	if a.ReadingTime == "" {
		return fmt.Errorf("readingTime is required")
	}
	if len(a.Tags) == 0 {
		return fmt.Errorf("tags are required")
	}
	if len(a.Accent) != 3 {
		return fmt.Errorf("accent must contain exactly 3 colors")
	}
	if len(a.FolderPreviewImages) != 3 {
		return fmt.Errorf("folderPreviewImages must contain exactly 3 images")
	}
	if a.BotThinkingImage == "" {
		return fmt.Errorf("botThinkingImage is required")
	}
	if a.Status != "" && a.Status != string(models.StatusDraft) && a.Status != string(models.StatusPublished) && a.Status != string(models.StatusArchived) {
		return fmt.Errorf("invalid status")
	}
	return nil
}
