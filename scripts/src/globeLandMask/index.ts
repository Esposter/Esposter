import type { WorldFeature } from "#src/models/globeLandMask/WorldFeature";

import { LAND_MASK_CELLS_PER_DEGREE, LAND_MASK_PATH } from "#src/services/globeLandMask/constants";
import { rasterizeLandMask } from "#src/services/globeLandMask/rasterizeLandMask";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { timeCommand } from "#src/services/timing/timeCommand";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

timeCommand("globe:gen");

const { features } = JSON.parse(readFileSync(resolve(import.meta.dirname, "world.json"), "utf8")) as {
  features: WorldFeature[];
};
const landMask = rasterizeLandMask(features, LAND_MASK_CELLS_PER_DEGREE);
const landMaskPath = resolve(REPOSITORY_ROOT, LAND_MASK_PATH);
mkdirSync(dirname(landMaskPath), { recursive: true });
writeFileSync(landMaskPath, JSON.stringify(landMask));
console.info(`${LAND_MASK_PATH}: ${landMask.rows.length} rows from ${features.length} countries`);
