import { IS_PRODUCTION } from "#shared/util/environment/constants";

export const DEBUG_TILE_LAYER_ALPHA = IS_PRODUCTION ? 0 : 0.7;
