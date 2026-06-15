package store

import (
	"context"
	"embed"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/nksv-ilya/neuroarchive/internal/models"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

type Store struct {
	db *sqlx.DB
}

func New(databaseURL string) (*Store, error) {
	db, err := sqlx.Connect("pgx", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("connect to database: %w", err)
	}
	return &Store{db: db}, nil
}

func (s *Store) Migrate() error {
	files, err := migrationsFS.ReadDir("migrations")
	if err != nil {
		return fmt.Errorf("read migrations dir: %w", err)
	}
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		content, err := migrationsFS.ReadFile("migrations/" + file.Name())
		if err != nil {
			return fmt.Errorf("read migration %s: %w", file.Name(), err)
		}
		if _, err := s.db.Exec(string(content)); err != nil {
			return fmt.Errorf("execute migration %s: %w", file.Name(), err)
		}
	}
	return nil
}

func (s *Store) Close() error {
	return s.db.Close()
}

func (s *Store) ListArticles(ctx context.Context, status string) ([]models.ArticleListItem, error) {
	query := `SELECT id, week, title, annotation, tags, accent, folder_preview_images, bot_thinking_image, status, reading_time, updated_at FROM articles`
	args := []interface{}{}
	if status != "" {
		query += ` WHERE status = $1`
		args = append(args, status)
	}
	query += ` ORDER BY updated_at DESC`

	var items []models.ArticleListItem
	if err := s.db.SelectContext(ctx, &items, query, args...); err != nil {
		return nil, err
	}
	return items, nil
}

func (s *Store) GetArticle(ctx context.Context, id string) (*models.Article, error) {
	var article models.Article
	query := `SELECT id, week, title, annotation, tags, accent, folder_preview_images, bot_thinking_image,
		reading_time, content, status, created_at, updated_at
		FROM articles WHERE id = $1`
	if err := s.db.GetContext(ctx, &article, query, id); err != nil {
		return nil, err
	}
	return &article, nil
}

func (s *Store) CreateArticle(ctx context.Context, a *models.Article) error {
	query := `INSERT INTO articles
		(id, week, title, annotation, tags, accent, folder_preview_images, bot_thinking_image,
		reading_time, content, status, created_at, updated_at)
		VALUES (:id, :week, :title, :annotation, :tags, :accent, :folder_preview_images, :bot_thinking_image,
		:reading_time, :content, :status, :created_at, :updated_at)`
	_, err := s.db.NamedExecContext(ctx, query, a)
	return err
}

func (s *Store) UpdateArticle(ctx context.Context, a *models.Article) error {
	query := `UPDATE articles SET
		week = :week,
		title = :title,
		annotation = :annotation,
		tags = :tags,
		accent = :accent,
		folder_preview_images = :folder_preview_images,
		bot_thinking_image = :bot_thinking_image,
		reading_time = :reading_time,
		content = :content,
		status = :status,
		updated_at = :updated_at
		WHERE id = :id`
	_, err := s.db.NamedExecContext(ctx, query, a)
	return err
}

func (s *Store) DeleteArticle(ctx context.Context, id string) error {
	_, err := s.db.ExecContext(ctx, `DELETE FROM articles WHERE id = $1`, id)
	return err
}

func (s *Store) SetArticleStatus(ctx context.Context, id string, status string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE articles SET status = $1, updated_at = $2 WHERE id = $3`, status, time.Now(), id)
	return err
}

func (s *Store) CountArticles(ctx context.Context) (int, error) {
	var count int
	if err := s.db.GetContext(ctx, &count, `SELECT COUNT(*) FROM articles`); err != nil {
		return 0, err
	}
	return count, nil
}

func (s *Store) ArticleExists(ctx context.Context, id string) (bool, error) {
	var count int
	if err := s.db.GetContext(ctx, &count, `SELECT COUNT(*) FROM articles WHERE id = $1`, id); err != nil {
		return false, err
	}
	return count > 0, nil
}

func (s *Store) SeedArticle(ctx context.Context, a *models.Article) error {
	exists, err := s.ArticleExists(ctx, a.ID)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}
	return s.CreateArticle(ctx, a)
}

func (s *Store) CreateUpload(ctx context.Context, u *models.Upload) error {
	query := `INSERT INTO uploads (id, filename, mime_type, path, created_at)
		VALUES (:id, :filename, :mime_type, :path, :created_at)`
	_, err := s.db.NamedExecContext(ctx, query, u)
	return err
}

func (s *Store) ListUploads(ctx context.Context) ([]models.Upload, error) {
	var uploads []models.Upload
	if err := s.db.SelectContext(ctx, &uploads, `SELECT * FROM uploads ORDER BY created_at DESC`); err != nil {
		return nil, err
	}
	return uploads, nil
}
