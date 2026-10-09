import { ENVELOPE_CARD_METRES } from "#src/services/genshinParity/passes/constants";
import { MathUtils } from "three";

// The envelope's window radius in pixels at a depth in metres, from the camera's vertical field of view and the frame's
// Height: half a card's projected width, so the window spans one card
export const computeEnvelopeRadius = (height: number, fov: number, depth: number): number =>
  Math.max(1, Math.round(((ENVELOPE_CARD_METRES / 2) * (height / 2 / Math.tan(MathUtils.degToRad(fov / 2)))) / depth));
