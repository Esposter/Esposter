import type { PavingStoneShape } from "genshin-engine";
import type { BufferGeometry } from "three";

import paving from "#src/data/windrise/paving.json";
import { createPavingGeometry } from "genshin-engine";

// Windrise's paving stones round its statue, each drawn where the export's arrangement places it as a prism over its
// Fitted outline (`fitWindrisePaving`), all merged into one geometry
export const createWindrisePavingGeometry = (): BufferGeometry => {
  const shapes: Record<string, PavingStoneShape> = paving.shapes;
  return createPavingGeometry(
    paving.placements.flatMap(({ mesh, position, rotation, scale }) => {
      const shape = shapes[mesh];
      return shape ? [{ position, quaternion: rotation, scale, shape }] : [];
    }),
  );
};
