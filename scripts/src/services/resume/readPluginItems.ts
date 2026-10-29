import type { InstalledPlugins } from "#src/models/resume/InstalledPlugins";
import type { Marketplace } from "#src/models/resume/Marketplace";
import type { ProjectSettings } from "#src/models/resume/ProjectSettings";
import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { getPluginItems } from "#src/services/resume/getPluginItems";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const readPluginItems = (): ResumeItem[] => {
  const marketplace = parseMachineJson<Marketplace>(
    readFileSync(join(REPOSITORY_ROOT, ".claude-plugin", "marketplace.json"), "utf8"),
  );
  const installed = parseMachineJson<InstalledPlugins>(
    readFileSync(join(homedir(), ".claude", "plugins", "installed_plugins.json"), "utf8"),
  );
  const settings = parseMachineJson<ProjectSettings>(
    readFileSync(join(REPOSITORY_ROOT, ".claude", "settings.json"), "utf8"),
  );
  // A plugin the checkout enables loads for this repo without an install record, so it counts as present too
  const enabledKeys = Object.entries(settings.enabledPlugins ?? {})
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);
  return getPluginItems(
    marketplace.name,
    marketplace.plugins.map(({ name }) => name),
    [...new Set([...Object.keys(installed.plugins), ...enabledKeys])],
  );
};
