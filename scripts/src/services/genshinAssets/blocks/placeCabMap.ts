import {
  ANIMESTUDIO_CAB_MAP_PATH,
  ANIMESTUDIO_MAPS_DIRECTORY,
  CAB_MAP_PATH,
} from "#src/services/genshinAssets/shared/constants";
import { copyFileSync, mkdirSync } from "node:fs";

// AnimeStudio reads its CAB map from the Maps folder beside it, not from a path it is given, so the parity folder's map is
// copied there by each map step. It is a copy, not a link, since a link fails when the CLI and the parity folder sit on
// different volumes
export const placeCabMap = (): void => {
  mkdirSync(ANIMESTUDIO_MAPS_DIRECTORY, { recursive: true });
  copyFileSync(CAB_MAP_PATH, ANIMESTUDIO_CAB_MAP_PATH);
};
