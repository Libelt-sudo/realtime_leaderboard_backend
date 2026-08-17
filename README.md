# Realtime Leaderboard

A backend API for a realtime leaderboard system built with Node.js, TypeScript, Express, PostgreSQL, and Redis. Player scores are stored in PostgreSQL and cached in a Redis Sorted Set. WebSocket support via Socket.IO broadcasts live leaderboard updates to all connected clients whenever a score changes or a new player registers.

## UPDATE
This project is now fully deployed! You can find it on my website, link in the description. 


## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Language | TypeScript |
| Framework | Express 5 |
| Database | PostgreSQL (via Prisma ORM) |
| Cache | Redis (Sorted Set) |
| Realtime | Socket.IO |
| Validation | Zod |
| Containerisation | Docker / Docker Compose |

## Project Structure

```
realtime_leaderboard/
├── src/
│   ├── app.ts                        # Express app, Socket.IO server, CORS config, route wiring
│   ├── services.ts                   # Startup: seeds Redis from Postgres if cache is empty
│   ├── redis_client.ts               # Redis client singleton
│   ├── handlers/
│   │   └── userHandlers.ts           # Route handlers + Socket.IO event emission (register, update, get)
│   ├── middleware/
│   │   └── validationMiddleware.ts   # Zod-based request body validation
│   ├── schemas/
│   │   └── userSchema.ts             # Zod schemas for request/response shapes
│   ├── lib/
│   │   └── prisma.ts                 # Prisma client singleton
│   └── generated/                    # Prisma-generated client (do not edit)
├── prisma/
│   └── schema.prisma                 # Database schema and Prisma config
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
└── package.json
```

## Data Model

```prisma
model User {
  id       Int    @id @default(autoincrement())
  username String @unique
  score    Int    @default(0)
  ranking  Rank   @default(COPPER)
}

enum Rank {
  COPPER | BRONZE | SILVER | GOLD | PLATINUM | DIAMOND | EMERALD | KOBOLT
}
```

## API Endpoints

### Register a player
```
POST /add
Content-Type: application/json

{ "username": "player1" }
```

Creates the user in PostgreSQL and adds them to the Redis leaderboard Sorted Set with an initial score of `0`.

### Update a player's score
```
POST /update/:username
Content-Type: application/json

{ "score": 150 }
```

Atomically increments (or decrements if negative) the player's score in both PostgreSQL and Redis. Emits a `leaderboard:update` event to all connected WebSocket clients with the refreshed leaderboard.

### Get leaderboard
```
GET /leaderboardstats
```

Returns the current ranked leaderboard read directly from the Redis Sorted Set.

## WebSocket Events (Socket.IO)

Connect to the server at `http://localhost:3000` using a Socket.IO client.

### `leaderboard:update` (server → client)

Emitted in three situations:

1. **On connection** — the server pushes the full leaderboard to the newly connected client immediately.
2. **On register** — after a new player is added, all clients receive the updated leaderboard.
3. **On score update** — after any score change, all clients receive the updated leaderboard.

Payload shape:
```json
{
  "leaderboard": [
    { "value": "player1", "score": 250 },
    { "value": "player2", "score": 100 }
  ]
}
```

The array is ordered highest score first (descending), fetched from the Redis Sorted Set via `ZRANGEWITHSCORES ... REV`.

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Node.js 22+

### 1. Clone the repo

```bash
git clone <repo-url>
cd realtime_leaderboard
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://<DB_USER>:<DB_PASS>@localhost:5433/<DB_NAME>
REDIS_URL=redis://localhost:6379
DB_USER=<your-db-user>
DB_PASS=<your-db-password>
DB_NAME=<your-db-name>
```

### 3. Start the infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL on port `5433` and Redis on port `6379`.

### 4. Install dependencies and run migrations

```bash
npm install
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run start:dev
```

The server starts at `http://localhost:3000`.

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Run with nodemon (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |

## How Caching Works

On startup, `loadData()` checks whether the `leaderboard` key exists in Redis and has entries. If not, it bulk-loads all users from PostgreSQL into the Sorted Set using a Redis pipeline. After that:

- **Register** — new user is written to Postgres, then added to the Sorted Set with `ZADD`. A `leaderboard:update` Socket.IO event is broadcast to all clients.
- **Update** — the new score is applied to Postgres with an atomic `increment`, then applired to Redis with the command `ZINCRBY`. A `leaderboard:update` Socket.IO event is broadcast to all clients.
- **Connect** — on every new WebSocket connection, the server immediately emits the current leaderboard to the client.


### CORS

The Socket.IO server and Express are both configured to accept connections from `http://localhost:5173` (the default Vite dev-server origin). Update `corsOptions` in `app.ts` if your frontend runs on a different port.
