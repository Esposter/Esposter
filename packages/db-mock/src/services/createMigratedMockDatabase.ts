import type { MockDatabase } from "#src/models/MockDatabase";

import { TEMPLATE_ROOT } from "#src/services/constants";
import { createMockDatabase } from "#src/services/createMockDatabase";
import { getTemplateDirectory } from "#src/services/getTemplateDirectory";
import { removeAbandonedCopies } from "#src/services/removeAbandonedCopies";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";

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
