# Frontend Static Server
FROM python:3.11-slim

WORKDIR /app

# Copy public directory (frontend files)
COPY public/ /app/

# Expose port
EXPOSE 8080

# Simple HTTP server
CMD ["python", "-m", "http.server", "8080", "--directory", "/app"]
