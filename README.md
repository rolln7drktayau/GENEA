# GENEA

GENEA is a full-stack genealogy platform built with Angular and Spring Boot.

Author: **rolln7drktayau**

## Repository structure

- `client/`: Angular frontend
- `server/`: Spring Boot API

## Language support

- Default language: **English**
- French translation option: available in the UI through the **Translate** button (login page and navigation menu)

## Quick start

### 1) Backend

```bash
cd server
./mvnw spring-boot:run
```

### 2) Frontend

```bash
cd client
npm install
npm start
```

Frontend runs on `http://localhost:4200` and connects to backend on `http://localhost:8080`.

## One-command startup (Windows)

From repository root:

```powershell
.\start-all.cmd
```

This opens two terminals:
- Spring Boot server (`http://localhost:8080`)
- Angular client (`http://localhost:4200`)

`make` is not required for this setup.

## Environment variables (server)

- `GENEA_MONGODB_URI`
- `APP_CORS_ALLOWED_ORIGINS`
- `GENEA_MAIL_HOST`
- `GENEA_MAIL_PORT`
- `GENEA_MAIL_USERNAME`
- `GENEA_MAIL_PASSWORD`
