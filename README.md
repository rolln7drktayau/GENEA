# GENEA

GENEA is a full-stack genealogy platform built with Angular and Spring Boot.

Author: **rolln7drktayau**

## Repository structure

- `client/`: Angular frontend
- `server/`: Spring Boot API

## Key features

- Refreshed welcome screen and tile-based navigation bar
- Theme switcher (`light` / `dark`) saved in browser storage
- UI language switcher (`English` default, `French` optional)
- Login, sign-up, and password reset directly from login page
- Role-based tree access:
  - `ADMIN`: can load all trees
  - `USER`: can load only own family tree
- Seeded short and long genealogy templates for test users
- Seeded genealogy forest: many short/medium/long template trees generated from
  all provided test users and admins

## One-command startup (Windows)

From repository root:

```powershell
.\start-all.cmd
```

This command:

- starts MongoDB (`MongoDB` service if available, otherwise local `mongod`)
- picks backend port `8080` if free, otherwise a free random port
- generates `client/proxy.auto.conf.json`
- starts server and client in separate shells

To stop generated shells and free ports:

```powershell
.\stop-all.cmd
```

## Manual startup

### Backend

```bash
cd server
./mvnw spring-boot:run
```

If port `8080` is already used, backend now auto-falls back to a free port.

### Frontend

```bash
cd client
npm install
npm run start:default
```

`start:default` uses `proxy.conf.json` (`http://localhost:8080`).
If backend is on a random port, use `npm run start:auto` (it auto-detects a running backend port and updates `proxy.auto.conf.json` before launching Angular).

## Default admin account (development)

- Login (email field): `rct`
- Password: `rct`
- Role: `ADMIN`

## Test users

GENEA seeds multiple user/admin templates on backend startup.

Examples:

- `rct` / `rct` (`ADMIN`)
- `user.basic@genea.local` / `Basic123!` (`USER`)
- `user.team1@genea.local` / `Team123!` (`USER`)
- `admin.ops@genea.local` / `AdminOps123!` (`ADMIN`)

Full list:

- `TEST_USERS.txt`

## Environment variables (server)

- `GENEA_MONGODB_URI`
- `APP_CORS_ALLOWED_ORIGINS`
- `GENEA_MAIL_HOST`
- `GENEA_MAIL_PORT`
- `GENEA_MAIL_USERNAME`
- `GENEA_MAIL_PASSWORD`
