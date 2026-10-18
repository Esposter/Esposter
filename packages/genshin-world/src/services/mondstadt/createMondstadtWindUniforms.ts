import type { WindUniforms } from "genshin-engine";

import { createWindUniforms } from "genshin-engine";
import {
  WIND_DIRECTION,
  WIND_GUST_SPEED,
  WIND_GUST_STRENGTH,
  WIND_GUST_WIDTH,
  WIND_STRENGTH,
} from "#src/services/windrise/constants";

// The meadows' wind is Mondstadt's own breeze, the one Windrise's scene is set with
// Starfell Valley and Windrise share the region's sky, so they share its wind until the meadows' reference is fitted with a stronger one
export const createMondstadtWindUniforms = (): WindUniforms => {
  const windUniforms = createWindUniforms();
  windUniforms.direction.value.copy(WIND_DIRECTION);
  windUniforms.gustSpeed.value = WIND_GUST_SPEED;
  windUniforms.gustStrength.value = WIND_GUST_STRENGTH;
  windUniforms.gustWidth.value = WIND_GUST_WIDTH;
  windUniforms.strength.value = WIND_STRENGTH;
  return windUniforms;
};
