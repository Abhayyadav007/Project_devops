import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Monorepo root: .../apps/http-backend/dist -> three levels up. */
function getRepoRoot(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "..", "..", "..");
}

function getDbPackageRoot(): string {
  return join(getRepoRoot(), "packages", "db");
}

/**
 * Runs `prisma migrate deploy` against DATABASE_URL (from env).
 * Idempotent; safe on every dev server start.
 */
export function runPrismaMigrateDeploy(): void {
  if (
    process.env.SKIP_PRISMA_MIGRATE_ON_START === "true" ||
    process.env.SKIP_PRISMA_MIGRATE_ON_START === "1"
  ) {
    console.warn(
      "[http-backend] SKIP_PRISMA_MIGRATE_ON_START is set; skipping prisma migrate deploy.",
    );
    return;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set before running migrations.");
  }

  const cwd = getDbPackageRoot();
  console.warn("[http-backend] Applying Prisma migrations…");
  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
    cwd,
    env: process.env,
    stdio: "inherit",
  });
}
