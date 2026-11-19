import type { PmxMorph } from "#src/models/character/PmxMorph";

import { FACE_BLINK_MORPH_NAME } from "#src/character/face/constants";
import { PmxMorphKind } from "#src/models/character/PmxMorphKind";
import { BufferAttribute } from "three";

// The blink as a morph target of a geometry with the given vertex count, its offsets placed on the vertices they move.
// A pack that names no vertex morph of that name has no blink, so there is no target
export const createBlinkMorphAttribute = (
  morphs: readonly PmxMorph[],
  vertexCount: number,
): BufferAttribute | undefined => {
  const morph = morphs.find(({ kind, name }) => kind === PmxMorphKind.Vertex && name === FACE_BLINK_MORPH_NAME);
  if (!morph) return undefined;
  const offsets = new Float32Array(vertexCount * 3);
  for (const [index, vertex] of morph.indices.entries())
    offsets.set(morph.values.subarray(index * 3, index * 3 + 3), vertex * 3);
  const attribute = new BufferAttribute(offsets, 3);
  attribute.name = FACE_BLINK_MORPH_NAME;
  return attribute;
};
