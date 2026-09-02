package cloudinary

import (
	"crypto/sha1"
	"encoding/hex"
	"testing"

	"imagine_backend/config"
)

// The signature is what authorises an upload — get the signed string wrong and
// Cloudinary rejects every gallery upload. Cloudinary's rule is: parameters
// sorted by key, joined "k=v" with "&", the API secret appended directly with
// no separator, SHA-1 hex. The expectation is built from that literal string,
// so this fails if sign() ever changes how it assembles it.
func TestSignBuildsCloudinaryString(t *testing.T) {
	config.AppConfig = &config.Config{CloudinaryAPISecret: "abcd"}

	got := sign(map[string]string{
		"public_id": "sample_image",
		"timestamp": "1315060076",
	})

	sum := sha1.Sum([]byte("public_id=sample_image&timestamp=1315060076" + "abcd"))
	want := hex.EncodeToString(sum[:])

	// Independently confirmed with sha1sum and node's crypto for the same input.
	const knownHex = "667f3f093b3ee3345a2027963505e5f911803d13"
	if want != knownHex {
		t.Fatalf("test vector drifted: %q != %q", want, knownHex)
	}
	if got != want {
		t.Fatalf("sign() = %q, want %q", got, want)
	}
}

// Parameters must be sorted by key, not taken in map order.
func TestSignIsOrderIndependent(t *testing.T) {
	config.AppConfig = &config.Config{CloudinaryAPISecret: "secret"}

	a := sign(map[string]string{"folder": "f", "timestamp": "1"})
	b := sign(map[string]string{"timestamp": "1", "folder": "f"})
	if a != b {
		t.Fatalf("signature depends on map iteration order: %q vs %q", a, b)
	}
}

func TestEnabledRequiresAllThreeCredentials(t *testing.T) {
	cases := []struct {
		name string
		cfg  config.Config
		want bool
	}{
		{"all set", config.Config{CloudinaryCloudName: "c", CloudinaryAPIKey: "k", CloudinaryAPISecret: "s"}, true},
		{"missing secret", config.Config{CloudinaryCloudName: "c", CloudinaryAPIKey: "k"}, false},
		{"missing cloud name", config.Config{CloudinaryAPIKey: "k", CloudinaryAPISecret: "s"}, false},
		{"none set", config.Config{}, false},
	}
	for _, tc := range cases {
		cfg := tc.cfg
		config.AppConfig = &cfg
		if got := Enabled(); got != tc.want {
			t.Errorf("%s: Enabled() = %v, want %v", tc.name, got, tc.want)
		}
	}
}
