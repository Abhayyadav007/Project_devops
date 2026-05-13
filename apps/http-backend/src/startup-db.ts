/** True when Prisma/Node reports the database server is unreachable. */
export function isDatabaseConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as { code?: unknown; message?: unknown; cause?: unknown };
  const code = record.code != null ? String(record.code) : "";
  const message = record.message != null ? String(record.message) : "";

  if (code === "ECONNREFUSED" || code === "P1001") {
    return true;
  }

  if (/ECONNREFUSED|P1001|Can't reach database server|connection refused/i.test(message)) {
    return true;
  }

  if (record.cause) {
    return isDatabaseConnectionError(record.cause);
  }

  return false;
}

/** Prisma P1003: database name in URL does not exist on the server. */
export function isDatabaseMissingError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as { code?: unknown; message?: unknown; cause?: unknown };
  const code = record.code != null ? String(record.code) : "";
  const message = record.message != null ? String(record.message) : "";

  if (code === "P1003") {
    return true;
  }

  if (/does not exist on the database server|DatabaseDoesNotExist|P1003/i.test(message)) {
    return true;
  }

  if (record.cause && isDatabaseMissingError(record.cause)) {
    return true;
  }

  return false;
}

export function printDatabaseConnectionHelp(): void {
  console.error(`
[http-backend] Cannot reach PostgreSQL.

Do this:
  1. Start PostgreSQL (e.g. Docker: docker run -p 5432:5432 -e POSTGRES_PASSWORD=... postgres).
  2. Set DATABASE_URL in apps/http-backend/.env (copy from .env.example).
  3. Apply schema: pnpm --filter @repo/db exec prisma migrate deploy

Optional — start the HTTP server without running the root validator seed (API routes still need a DB):
  SKIP_ROOT_VALIDATOR_SEED=true
`);
}

export function printDatabaseMissingHelp(dbName: string | null): void {
  const name = dbName ?? "your_database";
  console.error(`
[http-backend] Database "${name}" does not exist on the server.

Fix (pick one):
  1. Auto-create (default): keep AUTO_CREATE_DATABASE unset or not "false", then restart.
  2. Create manually: connect to an existing DB (e.g. postgres), then CREATE DATABASE ${name};
  3. Change DATABASE_URL to use a database that already exists.

Then apply migrations:
  pnpm --filter @repo/db exec prisma migrate deploy

To disable auto-create of the database:
  AUTO_CREATE_DATABASE=false
`);
}

export function isSchemaMissingError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const record = error as { code?: unknown; message?: unknown };
  const code = record.code != null ? String(record.code) : "";
  const message = record.message != null ? String(record.message) : "";
  return (
    code === "P2021" ||
    /relation .* does not exist|table .* does not exist/i.test(message)
  );
}

export function printRunMigrationsHelp(): void {
  console.error(`
[http-backend] The database exists but Prisma tables are missing.

Run:
  pnpm --filter @repo/db exec prisma migrate deploy
`);
}
