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

Default API base URL is defined in:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`
