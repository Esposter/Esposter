import type { WindrisePaving } from "#src/models/windrise/WindrisePaving";
import type { BufferGeometry } from "three";

import { createPavingGeometry } from "genshin-engine";

// Windrise's paving stones round its statue, each drawn where the export's arrangement places it as a prism over its
// Fitted outline (`fitWindrisePaving`), all merged into one geometry
export const createWindrisePavingGeometry = ({ placements, shapes }: WindrisePaving): BufferGeometry =>
  createPavingGeometry(
    placements.flatMap(({ mesh, position, rotation, scale }) => {
      const shape = shapes[mesh];
      return shape ? [{ position, quaternion: rotation, scale, shape }] : [];
    }),
  );
