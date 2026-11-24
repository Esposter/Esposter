import type { MockDatabase } from "#src/models/MockDatabase";

import { createMockDatabase } from "#src/services/createMockDatabase";
import { getResult, getResultAsync } from "@esposter/shared";
import { findRepositoryRoot } from "@esposter/shared-node/find-repository-root";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { cp, mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Applying the migrations is most of a file's fixed cost: each statement crosses Miniflare's binding one call at a
// Time, so every file paid the whole folder again. The migrated state is the same for every file, so the first one
// Builds it once into a folder named by its key, and every file copies that folder into a persistence root of its own,
// Where the migrator finds every migration already applied. A copy is the file's own, so no file's writes reach another
const TEMPLATE_ROOT = join(tmpdir(), "db-mock-templates");
const COPY_REGEX = /^copy-(?<processId>\d+)-/u;

// What the migrated state is built from: the migrations, the lockfile that resolves the migrator and Miniflare, and the
// Code that opens the database. A change to any of them is a new key and so a new template, never a stale one
const getTemplateKey = (coreMigrationsDirectory: string) => {
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

const getTemplateDirectory = async (coreMigrationsDirectory: string): Promise<string> => {
  const templateDirectory = join(TEMPLATE_ROOT, getTemplateKey(coreMigrationsDirectory));
  if (existsSync(templateDirectory)) return templateDirectory;

  // Built beside its final name and renamed into it, so no file reads a template half written. A file that builds the
  // Same template at the same time loses the rename, and keeps the winner's
  await mkdir(TEMPLATE_ROOT, { recursive: true });
  const buildingDirectory = await mkdtemp(`${templateDirectory}-`);
  const { dispose } = await createMockDatabase(coreMigrationsDirectory, buildingDirectory);
  await dispose();
  const renamed = await getResultAsync(async () => rename(buildingDirectory, templateDirectory));
  return renamed.match(
    () => templateDirectory,
    async (error) => {
      await rm(buildingDirectory, { force: true, recursive: true });
      if (!existsSync(templateDirectory)) throw error;
      return templateDirectory;
    },
  );
};

// Signal 0 only asks whether the process exists: `ESRCH` is the one answer that says it does not, since `EPERM` names a
// Process that exists but this user may not signal
const checkIsProcessRunning = (processId: number) =>
  getResult(() => process.kill(processId, 0)).match(
    () => true,
    (error) => !("code" in error) || error.code !== "ESRCH",
  );

// A copy is named by the process that made it, so a copy whose process has exited is one nothing reads, and the next
// Process to make a copy removes it. A file rarely disposes its database, and a worker can end without an exit event,
// So this is what keeps the copies from piling up in the temporary folder
const removeAbandonedCopies = () => {
  for (const entry of readdirSync(TEMPLATE_ROOT)) {
    const processId = Number(COPY_REGEX.exec(entry)?.groups?.processId);
    if (!processId || checkIsProcessRunning(processId)) continue;
    rmSync(join(TEMPLATE_ROOT, entry), { force: true, recursive: true });
  }
};

export const createMigratedMockDatabase = async (coreMigrationsDirectory: string): Promise<MockDatabase> => {
  const templateDirectory = await getTemplateDirectory(coreMigrationsDirectory);
  removeAbandonedCopies();
  const copyDirectory = await mkdtemp(join(TEMPLATE_ROOT, `copy-${process.pid}-`));
  await cp(templateDirectory, copyDirectory, { recursive: true });
  const mockDatabase = await createMockDatabase(coreMigrationsDirectory, copyDirectory);

  return {
    ...mockDatabase,
    dispose: async () => {
      await mockDatabase.dispose();
      await rm(copyDirectory, { force: true, recursive: true });
    },
  };
};
