import { MONDSTADT_EXPEDITIONS_PATH } from "#src/services/genshinAssets/expeditions/constants";
import { readMondstadtExpeditionPlaces } from "#src/services/genshinAssets/expeditions/readMondstadtExpeditionPlaces";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Mondstadt's expedition places written as one slice in the world's generated folder, returning its path
export const writeMondstadtExpeditions = (): string => {
  mkdirSync(dirname(MONDSTADT_EXPEDITIONS_PATH), { recursive: true });
  writeFileSync(MONDSTADT_EXPEDITIONS_PATH, `${JSON.stringify(readMondstadtExpeditionPlaces(), undefined, 2)}\n`);
  return MONDSTADT_EXPEDITIONS_PATH;
};
