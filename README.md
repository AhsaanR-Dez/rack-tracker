# rack-tracker

A data centre rack inventory app. Backend is Express 5 and TypeScript, database
is Postgres. Both run in Docker.

This is a work in progress. Right now the backend has a health endpoint and
nothing else. There is no database access yet.

## Layout

```
server/    the Express backend
```

A `web/` folder for the frontend gets added later.

## Running it locally

You need Docker Desktop running first.

1. Copy the example env file and fill in a password:

```
   copy .env.example .env
```

   `POSTGRES_PASSWORD` is blank in the example. Put anything in it, this is
   only ever local.

2. Start everything:

```
   docker compose up --build
```

   The database starts first. The API waits for it to pass its healthcheck
   before it boots, so the first run takes a moment.

3. Check it works:

```
   curl -i http://localhost:3000/healthz
```

   You should get a 200 and `{"status":"ok","uptime":N}`.

To stop it, Ctrl+C then `docker compose down`.

## Resetting the database

`docker compose down` on its own keeps the data. To wipe it and start from an
empty database:

```
docker compose down -v
```

The `-v` removes the volume. This matters once there are migrations, because
some database setup only runs on a brand new volume.

## Working on the backend

Running the whole stack in Docker means rebuilding the image on every change,
which is slow. For day to day work, run only the database in Docker and the
API on your machine:

```
docker compose up -d db
cd server
npm install
npm run dev
```

`npm run dev` restarts on file changes and prints readable logs instead of
JSON.

## Scripts

All of these run from inside `server/`.

| Script | What it does |
|---|---|
| `npm run dev` | Start the API with file watching |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled output |
| `npm run typecheck` | Type check without emitting |
| `npm run lint` | ESLint |
| `npm run format:check` | Check formatting |
| `npm test` | Run tests |

## Environment variables

| Variable | Used by | What it does |
|---|---|---|
| `POSTGRES_USER` | compose | Database user |
| `POSTGRES_PASSWORD` | compose | Database password |
| `POSTGRES_DB` | compose | Database name |
| `POSTGRES_PORT` | compose | Host port for Postgres, defaults to 5432 |
| `NODE_ENV` | api | `production` turns off pretty log formatting |
| `PORT` | api | Port the API listens on, defaults to 3000 |
| `LOG_LEVEL` | api | pino log level, defaults to `info` |