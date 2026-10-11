import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { CLAUDE_PLUGIN_MANIFEST_PATH } from "#src/services/sweeps/duplicateCode/constants";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

// The directory of the nearest Claude plugin above a file, the one holding the `.claude-plugin` manifest its installer reads.
// Undefined when no plugin holds it, so a file of an app or a shared package has no plugin root.
export const getPluginRoot = (sourceId: string): string | undefined => {
  for (let directory = dirname(sourceId); ; directory = dirname(directory)) {
    if (existsSync(join(directory, CLAUDE_PLUGIN_MANIFEST_PATH))) return directory;
    if (directory === REPOSITORY_ROOT || dirname(directory) === directory) return undefined;
  }
};
