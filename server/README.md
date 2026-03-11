# GENEA Server

Spring Boot backend API for the GENEA platform.

Author: **rolln7drktayau**

## Stack

- Java 21
- Spring Boot
- MongoDB

## Run locally

```bash
./mvnw spring-boot:run
```

Default API URL: `http://localhost:8080`

## Required environment variables

- `GENEA_MONGODB_URI` (default: `mongodb://localhost:27017/genea`)
- `APP_CORS_ALLOWED_ORIGINS` (default: `http://localhost:4200`)
- `GENEA_MAIL_HOST` (default: `smtp.gmail.com`)
- `GENEA_MAIL_PORT` (default: `587`)
- `GENEA_MAIL_USERNAME`
- `GENEA_MAIL_PASSWORD`

## Notes

- Sensitive values are no longer hardcoded in the repository.
- CORS origins are configurable through environment variables.
- A development admin account is ensured on startup:
  - Email: `rct`
  - Password: `rct`
  - Role: `ADMIN`
- Many additional test user templates are also seeded on startup.
  Full list: `../TEST_USERS.txt`
