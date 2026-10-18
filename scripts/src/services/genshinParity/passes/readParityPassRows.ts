import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { ROWS_START } from "#src/services/genshinParity/passes/constants";
import { getParityPassesPath } from "#src/services/genshinParity/passes/getParityPassesPath";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// The rows the report holds, which a run checks the frozen results it would move against before it rewrites them
export const readParityPassRows = async (component: DerivedAssetComponent): Promise<string[]> => {
  const passesPath = getParityPassesPath(component);
  if (!existsSync(passesPath)) return [];
  return (await readFile(passesPath, "utf8")).trimEnd().split("\n").slice(ROWS_START);
};
