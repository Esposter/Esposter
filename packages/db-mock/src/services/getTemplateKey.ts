import { createMockDatabase } from "#src/services/createMockDatabase";
import { findRepositoryRoot } from "@esposter/shared-node/find-repository-root";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// What the migrated state is built from: the migrations, the lockfile that resolves the migrator and Miniflare, and the
// Code that opens the database. A change to any of them is a new key and so a new template, never a stale one
export const getTemplateKey = (coreMigrationsDirectory: string) => {
  const hash = createHash("sha256")
    .update(readFileSync(join(findRepositoryRoot(process.cwd()), "pnpm-lock.yaml")))
    .update(createMockDatabase.toString());
  for (const name of readdirSync(coreMigrationsDirectory).toSorted()) {
    const migrationPath = join(coreMigrationsDirectory, name, "migration.sql");
    hash.update(name);
    if (existsSync(migrationPath)) hash.update(readFileSync(migrationPath));
  }
  return hash.digest("hex");
};
