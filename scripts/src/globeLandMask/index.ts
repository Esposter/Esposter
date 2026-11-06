import type { WorldFeature } from "#src/models/globeLandMask/WorldFeature";

import { formatSource } from "#src/services/format/formatSource";
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
// A file under `generated/` is committed as the formatter writes it, so the output goes through the formatter, under a name
// The formatter does not ignore
const landMaskSource = JSON.stringify(landMask);
writeFileSync(
  landMaskPath,
  formatSource(landMaskSource, "landMask.json", REPOSITORY_ROOT, REPOSITORY_ROOT) ?? landMaskSource,
);
console.info(`${LAND_MASK_PATH}: ${landMask.rows.length} rows from ${features.length} countries`);
