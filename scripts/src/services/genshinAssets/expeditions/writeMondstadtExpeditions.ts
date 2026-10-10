import { MONDSTADT_EXPEDITIONS_PATH } from "#src/services/genshinAssets/expeditions/constants";
import { readMondstadtExpeditionPlaces } from "#src/services/genshinAssets/expeditions/readMondstadtExpeditionPlaces";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Mondstadt's expedition places written as one slice in the world's generated folder, returning its path
export const writeMondstadtExpeditions = (): string => {
  mkdirSync(dirname(MONDSTADT_EXPEDITIONS_PATH), { recursive: true });
  writeJsonFile(MONDSTADT_EXPEDITIONS_PATH, readMondstadtExpeditionPlaces());
  return MONDSTADT_EXPEDITIONS_PATH;
};
