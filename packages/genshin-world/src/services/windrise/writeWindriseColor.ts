import { WINDRISE_GROUND_PAINT, WINDRISE_SEED } from "#src/services/windrise/constants";
import { createGroundPaintColor } from "genshin-engine";

// Windrise's ground painted by its layers, its patches on their own seed
export const writeWindriseColor = createGroundPaintColor(WINDRISE_GROUND_PAINT, WINDRISE_SEED + 1);
