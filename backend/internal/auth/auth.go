package auth

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const cookieName = "admin_token"

type Auth struct {
	adminHash   []byte
	jwtSecret   []byte
	secureCookie bool
	domain      string
}

func New(adminPasswordHash string, jwtSecret string, secureCookie bool, domain string) (*Auth, error) {
	if adminPasswordHash == "" || jwtSecret == "" {
		return nil, errors.New("admin password hash and JWT secret are required")
	}
	return &Auth{
		adminHash:    []byte(adminPasswordHash),
		jwtSecret:    []byte(jwtSecret),
		secureCookie: secureCookie,
		domain:       domain,
	}, nil
}

func (a *Auth) VerifyPassword(password string) bool {
	if err := bcrypt.CompareHashAndPassword(a.adminHash, []byte(password)); err != nil {
		return false
	}
	return true
}

func (a *Auth) GenerateToken() (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": "admin",
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
	})
	return token.SignedString(a.jwtSecret)
}

func (a *Auth) SetCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    token,
		Path:     "/",
		Domain:   a.domain,
		MaxAge:   int(7 * 24 * time.Hour.Seconds()),
		HttpOnly: true,
		Secure:   a.secureCookie,
		SameSite: http.SameSiteStrictMode,
	})
}

func (a *Auth) ClearCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    "",
		Path:     "/",
		Domain:   a.domain,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   a.secureCookie,
		SameSite: http.SameSiteStrictMode,
	})
}

func (a *Auth) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(cookieName)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		token, err := jwt.Parse(cookie.Value, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return a.jwtSecret, nil
		})
		if err != nil || !token.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), "admin", true)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
