import { Client } from "pg";

/** Extract database name from a PostgreSQL connection URL. */
export function parseDatabaseNameFromUrl(databaseUrl: string): string | null {
  try {
    const u = new URL(databaseUrl);
    const segment = u.pathname.replace(/^\//, "").split("/")[0];
    if (!segment) {
      return null;
    }
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

/**
 * Connects to the maintenance database `postgres` and creates the target
 * database if it is missing. Skips when AUTO_CREATE_DATABASE=false.
 */
export async function ensureTargetDatabaseExists(databaseUrl: string): Promise<void> {
  if (process.env.AUTO_CREATE_DATABASE === "false") {
    return;
  }

  const dbName = parseDatabaseNameFromUrl(databaseUrl);
  if (!dbName || dbName === "postgres") {
    return;
  }

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = "/postgres";

  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();

  try {
    const { rows } = await client.query<{ exists: boolean }>(
      "SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = $1) AS exists",
      [dbName],
    );

    if (rows[0]?.exists) {
      return;
    }

    const safe = dbName.replace(/"/g, '""');
    await client.query(`CREATE DATABASE "${safe}"`);
    console.warn(`[http-backend] Created missing database "${dbName}".`);
  } finally {
    await client.end();
  }
}
