import { MINIMUM_RAMP_WIDTH_VERTEX } from "#src/character/shading/constants";

export interface RampWidthInputs {
  // The vertex's ramp weight, which scales the width where the flag is set
  isVertexRampWidth: boolean;
  rampWidth: number;
  vertexRampWidth: number;
}

// The width of the shadow ramp's band, w, scaled by the vertex's ramp weight where its flag is set, never below its floor
export const getRampWidth = ({ isVertexRampWidth, rampWidth, vertexRampWidth }: RampWidthInputs): number =>
  isVertexRampWidth ? Math.max(2 * vertexRampWidth, MINIMUM_RAMP_WIDTH_VERTEX) * rampWidth : rampWidth;
