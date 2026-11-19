import type { PropOutline } from "#src/models/kits/props/PropOutline";
import type { BufferGeometry } from "three";

import { createPropGeometry } from "#src/kits/props/createPropGeometry";

// A pole is one slim section stood on its foot, and every other prop one unit block, so the record's scale sizes it
const POLE_RADIUS = 0.05;
const POLE_OUTLINE: PropOutline = {
  axis: [0, 0],
  foot: 0,
  sections: [{ bottomRadius: POLE_RADIUS, height: 1, topRadius: POLE_RADIUS }],
};
const BLOCK_OUTLINE: PropOutline = { boxes: [[-0.5, 0, -0.5, 0.5, 1, 0.5]] };

// A fishing-area prop's stand-in, generated from its name rather than fitted from the game's mesh. A name holding "Pole"
// Is a fishing pole, a round kind; every other name, a prop or a fish stand, is a solid kind
export const createPropStandInGeometry = (name: string): BufferGeometry =>
  createPropGeometry(name.includes("Pole") ? POLE_OUTLINE : BLOCK_OUTLINE);
