import { TEMPLATE_ROOT } from "#src/services/constants";
import { createMockDatabase } from "#src/services/createMockDatabase";
import { getTemplateKey } from "#src/services/getTemplateKey";
import { getResultAsync } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { join } from "node:path";

export const getTemplateDirectory = async (coreMigrationsDirectory: string): Promise<string> => {
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
