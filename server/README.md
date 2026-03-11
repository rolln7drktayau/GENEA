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

If port `8080` is already in use, the application now auto-selects a free local port.

## Main API additions

- `GET /api/persons/tree/{id}`
  - `ADMIN`: returns all persons for global tree visualization
  - `USER`: returns only own family tree scope
  - Test-user forest is generated automatically with many short/medium/long trees
- `POST /api/persons/reset-password`
  - body: `{ "email": "...", "newPassword": "..." }`

## Required environment variables

- `GENEA_MONGODB_URI` (default: `mongodb://localhost:27017/genea`)
- `APP_CORS_ALLOWED_ORIGINS` (default: `http://localhost:4200`)
- `GENEA_MAIL_HOST` (default: `smtp.gmail.com`)
- `GENEA_MAIL_PORT` (default: `587`)
- `GENEA_MAIL_USERNAME`
- `GENEA_MAIL_PASSWORD`

## Notes

- Sensitive values are not hardcoded in the repository.
- CORS origins are configurable through environment variables.
- Development admin account is ensured on startup:
  - Email/Login: `rct`
  - Password: `rct`
  - Role: `ADMIN`
- Many additional test user templates are seeded on startup.
  Full list: `../TEST_USERS.txt`
- Seeded template users are linked into both long and short default trees.
