# Build stage
FROM golang:1.25.4-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy dependency files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build migration binary
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/migration cmd/migration/main.go

# Build server binary
RUN CGO_ENABLED=0 GOOS=linux go build -o bin/imagine_backend cmd/server/main.go

# Final stage
FROM alpine:latest

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy binaries from builder
COPY --from=builder /app/bin/migration ./bin/
COPY --from=builder /app/bin/imagine_backend ./bin/
COPY --from=builder /app/start.sh ./

# Set permissions
RUN chmod +x ./start.sh

# Export port
EXPOSE 8080

# Command to run
CMD ["./start.sh"]
