# GENEA Client

Angular frontend for the GENEA platform.

Author: **rolln7drktayau**

## Features

- Family tree interface
- Authentication flow (sign in/sign up)
- Family, memories, profile pages
- English-first UI with French translation toggle

## Language toggle

- On login page: click the **Translate** button
- After login: use the **Translate** entry in the left navigation

## Roles

- `USER`: standard access
- `ADMIN`: access to admin-only pages (for example `/team`)
- Ready-to-use test accounts are listed in `../TEST_USERS.txt`

## Run locally

```bash
npm install
npm start
```

App URL: `http://localhost:4200`

## Build

```bash
npm run build
```

## Tests

```bash
npm run test -- --watch=false --browsers=ChromeHeadless
```

## API configuration

API calls use relative paths (`/api/...`) and are routed through Angular proxy config:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
- `proxy.conf.json` (default local target: `http://localhost:8080`)
