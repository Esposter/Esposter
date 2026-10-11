import { LERNA_FILE } from "#src/services/package/new/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Lerna runs in fixed mode, so the one version it holds is the version every member is held to, a new one included
export const getLernaVersion = (root: string): string =>
  parseMachineJson<{ version: string }>(readFileSync(join(root, LERNA_FILE), "utf8")).version;
