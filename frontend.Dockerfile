FROM python:3.11-slim

WORKDIR /app

COPY public/ /app/public/

EXPOSE 8080

CMD ["python", "-m", "http.server", "8080", "--directory", "/app/public"]
