# NeuraOne Projects API

An AI-assisted learning project for the HackIndia Express track. Built for Harsh Patel to review, run, and maintain. Node.js 24 and Express 5 provide a small project catalogue API.

## Run

Install Node.js 24, then in this directory:

```sh
npm ci
npm start
```

The default address is http://127.0.0.1:3000. Optionally copy `.env.example` to `.env` and change `PORT` and `HOST`. Configuration is validated before the server starts. No API keys or external services are required.

```sh
npm test
```

Tests use Node's built-in runner and real HTTP requests on an ephemeral local port.

## Test coverage

`npm test` passed all four tests on Node.js 24.19.0:

- JSON metadata, health responses, and request IDs.
- Project creation, retrieval, filtering, and pagination.
- Invalid bodies, malformed JSON, oversized input, invalid queries, and missing routes.
- Startup configuration validation.

Tests create isolated app instances and close their HTTP servers after each case.

## Endpoints

| Method | Path | Result |
|---|---|---|
| GET | `/` | API metadata, 200 |
| GET | `/health` | Health response, 200 |
| POST | `/projects` | Create a project, 201 and Location header |
| GET | `/projects/:id` | Project or 404 |
| GET | `/projects?tech=node&limit=20&offset=0` | Filtered, paginated list |

Create an example project:

```sh
curl -i http://127.0.0.1:3000/projects \
  -H 'Content-Type: application/json' \
  -d '{"title":"NeuraOne demo","tech":"node"}'
curl 'http://127.0.0.1:3000/projects?tech=node&limit=10&offset=0'
```

Use the returned `id` with `GET /projects/:id`. Both `title` and `tech` are required nonempty strings (maximum 120 and 40 characters). Technology names are normalized to lower case. Limits are 1–100; offset must be a nonnegative safe integer.

Errors use `{ "error": { "message": "..." }, "requestId": "..." }`. Invalid input returns 400, unknown resources/routes 404, unsupported POST content types 415, and bodies over 16 KiB 413. Unexpected errors return a generic 500 without exposing stack traces.

## Structure and track requirements

- `src/server.js`: startup and shutdown.
- `src/config.js`: environment variables and validation.
- `src/app.js`: middleware order, request IDs, minimal logs, JSON parsing, routes.
- `src/projects.js`: Router, body/query/path handling, in-memory repository.
- `src/errors.js`: final centralized error handler; async route errors propagate through Express 5.
- `test/api.test.js`: HTTP behavior and configuration tests.

## Limitations

This is a local learning demo. Data resets when the process restarts. There is no authentication, database, authorization or rate limiting. Do not expose it as a public production service or store personal information. The default host binds to localhost. No claim is made that this implements NeuraOne's production AI or cybersecurity services.

## HackIndia submission

Review the source and run the tests before submitting this public repository through the Express track's normal Hand in workflow. The GitHub identity linked to HackIndia must match the repository contributor. Badge/XP approval is determined by HackIndia.
