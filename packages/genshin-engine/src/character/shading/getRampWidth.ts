import type { RampWidthInputs } from "#src/models/character/RampWidthInputs";

import { MINIMUM_RAMP_WIDTH_VERTEX } from "#src/character/shading/constants";

// The width of the shadow ramp's band, w, scaled by the vertex's ramp weight where its flag is set, never below its floor
export const getRampWidth = ({ isVertexRampWidth, rampWidth, vertexRampWidth }: RampWidthInputs): number =>
  isVertexRampWidth ? Math.max(2 * vertexRampWidth, MINIMUM_RAMP_WIDTH_VERTEX) * rampWidth : rampWidth;
