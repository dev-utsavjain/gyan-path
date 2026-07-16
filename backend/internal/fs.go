package webserver

import "embed"

//go:embed all:dist
var DistFolder embed.FS
