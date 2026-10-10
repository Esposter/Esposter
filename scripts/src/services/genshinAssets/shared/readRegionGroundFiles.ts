import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { globSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

// Each region's ground the world package keeps as an authored source, by its region and as its file holds it: the
// Plateaus its places stand on, whose capital's `fit windrise` raises and no fit draws whole
export const readRegionGroundFiles = async (): Promise<Record<string, unknown>> =>
  Object.fromEntries(
    await Promise.all(
      globSync("*/ground.json", { cwd: WORLD_DATA_DIRECTORY })
        .toSorted()
        .map(async (path) => [
          dirname(path),
          parseMachineJson(await readFile(join(WORLD_DATA_DIRECTORY, path), "utf8")),
        ]),
    ),
  );
