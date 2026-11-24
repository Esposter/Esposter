import type { MockDatabase } from "#src/models/MockDatabase";

import { COPY_PREFIX, TEMPLATE_ROOT } from "#src/services/constants";
import { createMockDatabase } from "#src/services/createMockDatabase";
import { getTemplateDirectory } from "#src/services/getTemplateDirectory";
import { removeAbandonedEntries } from "#src/services/removeAbandonedEntries";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";

export const createMigratedMockDatabase = async (coreMigrationsDirectory: string): Promise<MockDatabase> => {
  const templateDirectory = await getTemplateDirectory(coreMigrationsDirectory);
  removeAbandonedEntries();
  const copyDirectory = await mkdtemp(join(TEMPLATE_ROOT, `${COPY_PREFIX}-${process.pid}-`));
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
