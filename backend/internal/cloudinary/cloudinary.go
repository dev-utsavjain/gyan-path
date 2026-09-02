// Package cloudinary is a minimal signed-upload helper for Cloudinary, the
// object store this site already serves its media from. It deliberately avoids
// the official SDK: the only two operations needed are "sign an upload the
// browser will perform" and "destroy an object", and both are a sorted
// parameter string hashed with SHA-1.
//
// The browser uploads the bytes directly to Cloudinary, so files never pass
// through this server or its database.
package cloudinary

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"imagine_backend/config"
)

// Folder every gallery upload lands in, so the media library stays tidy.
const GalleryFolder = "gyaanpath/gallery"

// Enabled reports whether Cloudinary credentials are configured. When false,
// uploads are unavailable and only pasted links work.
func Enabled() bool {
	return config.AppConfig.CloudinaryCloudName != "" &&
		config.AppConfig.CloudinaryAPIKey != "" &&
		config.AppConfig.CloudinaryAPISecret != ""
}

// sign builds Cloudinary's signature: the parameters sorted by key, joined as
// a query string, with the API secret appended, then SHA-1 hex encoded.
func sign(params map[string]string) string {
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		parts = append(parts, k+"="+params[k])
	}

	sum := sha1.Sum([]byte(strings.Join(parts, "&") + config.AppConfig.CloudinaryAPISecret))
	return hex.EncodeToString(sum[:])
}

// UploadSignature is everything the admin browser needs to upload one file
// directly to Cloudinary.
type UploadSignature struct {
	CloudName string `json:"cloud_name"`
	APIKey    string `json:"api_key"`
	Timestamp int64  `json:"timestamp"`
	Signature string `json:"signature"`
	Folder    string `json:"folder"`
}

// SignUpload authorises a single upload into the gallery folder. Signatures are
// short-lived (Cloudinary rejects timestamps older than ~1 hour).
func SignUpload() (UploadSignature, error) {
	if !Enabled() {
		return UploadSignature{}, fmt.Errorf("cloudinary: not configured")
	}
	ts := time.Now().Unix()
	return UploadSignature{
		CloudName: config.AppConfig.CloudinaryCloudName,
		APIKey:    config.AppConfig.CloudinaryAPIKey,
		Timestamp: ts,
		Signature: sign(map[string]string{
			"folder":    GalleryFolder,
			"timestamp": strconv.FormatInt(ts, 10),
		}),
		Folder: GalleryFolder,
	}, nil
}

// Destroy permanently removes an uploaded object. resourceType is "image" or
// "video". Callers treat failure as non-fatal — the database row is the source
// of truth for what the site shows.
func Destroy(publicID, resourceType string) error {
	if !Enabled() {
		return fmt.Errorf("cloudinary: not configured")
	}
	if publicID == "" {
		return fmt.Errorf("cloudinary: empty public_id")
	}
	if resourceType != "video" {
		resourceType = "image"
	}

	ts := strconv.FormatInt(time.Now().Unix(), 10)
	form := url.Values{
		"public_id": {publicID},
		"timestamp": {ts},
		"api_key":   {config.AppConfig.CloudinaryAPIKey},
		"signature": {sign(map[string]string{"public_id": publicID, "timestamp": ts})},
	}

	endpoint := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/%s/destroy",
		config.AppConfig.CloudinaryCloudName, resourceType)

	client := &http.Client{Timeout: 15 * time.Second}
	res, err := client.PostForm(endpoint, form)
	if err != nil {
		return fmt.Errorf("cloudinary: destroy: %w", err)
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return fmt.Errorf("cloudinary: destroy returned %d", res.StatusCode)
	}
	return nil
}
