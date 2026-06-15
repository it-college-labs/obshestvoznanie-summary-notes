package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

type ArticleStatus string

const (
	StatusDraft     ArticleStatus = "draft"
	StatusPublished ArticleStatus = "published"
	StatusArchived  ArticleStatus = "archived"
)

type ArticleMeta struct {
	ID                 string    `json:"id" db:"id"`
	Week               string    `json:"week" db:"week"`
	Title              string    `json:"title" db:"title"`
	Annotation         string    `json:"annotation" db:"annotation"`
	Tags               JSONArray `json:"tags" db:"tags"`
	Accent             JSONArray `json:"accent" db:"accent"`
	FolderPreviewImages JSONArray `json:"folderPreviewImages" db:"folder_preview_images"`
	BotThinkingImage   string    `json:"botThinkingImage" db:"bot_thinking_image"`
	ReadingTime        string    `json:"readingTime" db:"reading_time"`
	Status             string    `json:"status" db:"status"`
	CreatedAt          time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt          time.Time `json:"updatedAt" db:"updated_at"`
}

type JSONArray []string

func (a JSONArray) Value() (driver.Value, error) {
	return json.Marshal(a)
}

func (a *JSONArray) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	b, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("type assertion to []byte failed for JSONArray, got %T", value)
	}
	return json.Unmarshal(b, (*[]string)(a))
}

type Article struct {
	ArticleMeta
	Content Block `json:"content" db:"content"`
}

type ArticleListItem struct {
	ID                  string    `json:"id" db:"id"`
	Week                string    `json:"week" db:"week"`
	Title               string    `json:"title" db:"title"`
	Annotation          string    `json:"annotation" db:"annotation"`
	Tags                JSONArray `json:"tags" db:"tags"`
	Accent              JSONArray `json:"accent" db:"accent"`
	FolderPreviewImages JSONArray `json:"folderPreviewImages" db:"folder_preview_images"`
	BotThinkingImage    string    `json:"botThinkingImage" db:"bot_thinking_image"`
	Status              string    `json:"status" db:"status"`
	ReadingTime         string    `json:"readingTime" db:"reading_time"`
	UpdatedAt           time.Time `json:"updatedAt" db:"updated_at"`
}

type ArticlePublic struct {
	Meta     ArticleMeta `json:"meta"`
	HTML     string      `json:"html"`
	Headings []Heading   `json:"headings"`
}

type Heading struct {
	Level int    `json:"level"`
	Text  string `json:"text"`
	ID    string `json:"id"`
}

// Block is a generic JSON document node. We store it as JSONB in Postgres.
type Block struct {
	Type    string                 `json:"type"`
	Attrs   map[string]interface{} `json:"attrs,omitempty"`
	Content []Block                `json:"content,omitempty"`
	Text    string                 `json:"text,omitempty"`
	Marks   []Mark                 `json:"marks,omitempty"`
}

type Mark struct {
	Type  string `json:"type"`
	Attrs map[string]interface{} `json:"attrs,omitempty"`
}

func (b Block) Value() (driver.Value, error) {
	return json.Marshal(b)
}

func (b *Block) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed for Block")
	}
	return json.Unmarshal(bytes, b)
}

// Upload model for uploaded assets.
type Upload struct {
	ID        string    `json:"id" db:"id"`
	Filename  string    `json:"filename" db:"filename"`
	MimeType  string    `json:"mimeType" db:"mime_type"`
	Path      string    `json:"path" db:"path"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

type LoginRequest struct {
	Password string `json:"password"`
}
