import { getIsProduction } from "@esposter/shared";

export const DEBUG_TILE_LAYER_ALPHA = getIsProduction() ? 0 : 0.7;
