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
If port `8080` is already used, prefer `.\start-all.cmd` (it auto-picks a free backend port).

## Default admin account (development)

- Username (email field): `rct`
- Password: `rct`
- Role: `ADMIN`

## One-command startup (Windows)

From repository root:

```powershell
.\start-all.cmd
```

This opens two terminals:
- Spring Boot server (`http://localhost:8080` by default, or a free random port if `8080` is busy)
- Angular client (`http://localhost:4200`)
- The script also starts MongoDB automatically:
  - first choice: starts the `MongoDB` Windows service
  - fallback: runs `mongod` from your MongoDB installation with local data folder `.mongo-data/`
- The script auto-generates an Angular proxy config and points `/api` to the selected backend port.

`make` is not required for this setup.

## Test users

GENEA now seeds many test user templates (USER and ADMIN) on backend startup.

Quick examples:
- `rct` / `rct` (`ADMIN`)
- `user.basic@genea.local` / `Basic123!` (`USER`)
- `user.team1@genea.local` / `Team123!` (`USER`, team profile)
- `admin.ops@genea.local` / `AdminOps123!` (`ADMIN`)

Full test user catalog is available in:
- `TEST_USERS.txt` (repository root)

## Environment variables (server)

- `GENEA_MONGODB_URI`
- `APP_CORS_ALLOWED_ORIGINS`
- `GENEA_MAIL_HOST`
- `GENEA_MAIL_PORT`
- `GENEA_MAIL_USERNAME`
- `GENEA_MAIL_PASSWORD`
