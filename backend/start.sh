#!/bin/sh

set -e

echo "Running migrations..."
./bin/migration

echo "Starting server..."
./bin/imagine_backend
