package upload

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/nksv-ilya/neuroarchive/internal/models"
)

type Service struct {
	uploadDir string
	baseURL   string
}

func New(uploadDir, baseURL string) *Service {
	return &Service{
		uploadDir: uploadDir,
		baseURL:   baseURL,
	}
}

func (s *Service) Save(file io.Reader, header *models.Upload) (string, error) {
	if err := os.MkdirAll(s.uploadDir, 0755); err != nil {
		return "", fmt.Errorf("create upload dir: %w", err)
	}

	if header.ID == "" {
		header.ID = generateID()
	}

	ext := ".bin"
	exts, _ := mime.ExtensionsByType(header.MimeType)
	if len(exts) > 0 {
		ext = exts[0]
	}

	id := generateID()
	filename := id + ext
	path := filepath.Join(s.uploadDir, filename)

	out, err := os.Create(path)
	if err != nil {
		return "", fmt.Errorf("create file: %w", err)
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		return "", fmt.Errorf("write file: %w", err)
	}

	return filename, nil
}

func (s *Service) URL(filename string) string {
	base := strings.TrimSuffix(s.baseURL, "/")
	return base + "/uploads/" + filename
}

func (s *Service) LocalPath(filename string) string {
	return filepath.Join(s.uploadDir, filename)
}

func generateID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b)
}

func AllowedMimeType(mimeType string) bool {
	allowed := []string{
		"image/jpeg",
		"image/png",
		"image/webp",
		"image/gif",
	}
	for _, a := range allowed {
		if a == mimeType {
			return true
		}
	}
	return false
}

func SniffMimeType(file io.ReadSeeker, filename string) string {
	const sniffSize = 512
	buf := make([]byte, sniffSize)
	n, _ := io.ReadFull(file, buf)
	file.Seek(0, io.SeekStart)

	if n > 0 {
		mimeType := http.DetectContentType(buf[:n])
		if mimeType != "application/octet-stream" {
			return mimeType
		}
	}
	return mime.TypeByExtension(filepath.Ext(filename))
}
