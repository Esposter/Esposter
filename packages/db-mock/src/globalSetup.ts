import { getMigrationsDirectory } from "#src/services/getMigrationsDirectory";
import { getTemplateDirectory } from "#src/services/getTemplateDirectory";

// Vitest runs a project's global setup once, in the main process, before any worker starts, so the migrated template
// Is built once and every test file copies it. Without it a cold machine has every file that starts before the first
// Build lands build a template of its own, a Miniflare boot and every migration each, and throw all but one away
const setupMockDatabaseTemplate = async (): Promise<void> => {
  await getTemplateDirectory(getMigrationsDirectory("core"));
};

export default setupMockDatabaseTemplate;
