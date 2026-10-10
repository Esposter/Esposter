import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { getPluginItems } from "#src/services/resume/getPluginItems";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

interface InstalledPlugins {
  plugins: Record<string, unknown>;
}

interface Marketplace {
  name: string;
  plugins: { name: string }[];
}

export const readPluginItems = (): ResumeItem[] => {
  const marketplace = parseMachineJson<Marketplace>(
    readFileSync(join(REPOSITORY_ROOT, ".claude-plugin", "marketplace.json"), "utf8"),
  );
  const installed = parseMachineJson<InstalledPlugins>(
    readFileSync(join(homedir(), ".claude", "plugins", "installed_plugins.json"), "utf8"),
  );
  return getPluginItems(
    marketplace.name,
    marketplace.plugins.map(({ name }) => name),
    Object.keys(installed.plugins),
  );
};
