import { BUILD_PREFIX, TEMPLATE_ROOT } from "#src/services/constants";
import { createMockDatabase } from "#src/services/createMockDatabase";
import { getTemplateKey } from "#src/services/getTemplateKey";
import { getResultAsync } from "@esposter/shared";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rename, rm, utimes } from "node:fs/promises";
import { join } from "node:path";

export const getTemplateDirectory = async (coreMigrationsDirectory: string): Promise<string> => {
  const templateDirectory = join(TEMPLATE_ROOT, getTemplateKey(coreMigrationsDirectory));
  // A read renews the template's age, so the reaper takes only a template no run has read for its age
  if (existsSync(templateDirectory)) {
    const now = new Date();
    await utimes(templateDirectory, now, now);
    return templateDirectory;
  }

  // Built in the temporary folder under the building process's own name, then renamed into its final name, so no file
  // Reads a template half written. A file that builds the same template at the same time loses the rename, and keeps
  // The winner's. A build whose process was killed is one the reaper removes once that process has exited
  await mkdir(TEMPLATE_ROOT, { recursive: true });
  const buildingDirectory = await mkdtemp(join(TEMPLATE_ROOT, `${BUILD_PREFIX}-${process.pid}-`));
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
