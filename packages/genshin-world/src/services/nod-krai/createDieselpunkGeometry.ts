import type { DieselpunkOptions } from "#src/models/nod-krai/DieselpunkOptions";
import type { BufferGeometry } from "three";

import { createPipeworkGeometry } from "#src/services/nod-krai/createPipeworkGeometry";
import { createBoxesGeometry, createLatheStackGeometry, mergeGeometryParts } from "genshin-engine";

const SMOKESTACK_RADIAL_SEGMENTS = 12;
// A dieselpunk structure as one geometry for one material: its boxes of sheds, plates and cranes, its pipework and its
// Smokestacks. Every part is indexed, so the parts merge; a faceted stack would not
export const createDieselpunkGeometry = ({
  boxes,
  pipeRadius,
  pipeRuns,
  smokestacks,
}: DieselpunkOptions): BufferGeometry => {
  const smokestackParts = smokestacks.map(({ position, sections }) =>
    createLatheStackGeometry({ isFaceted: false, radialSegments: SMOKESTACK_RADIAL_SEGMENTS, sections }).translate(
      position.x,
      position.y,
      position.z,
    ),
  );
  return mergeGeometryParts([
    createBoxesGeometry(boxes),
    createPipeworkGeometry(pipeRuns, pipeRadius),
    ...smokestackParts,
  ]);
};
