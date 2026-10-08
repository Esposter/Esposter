import type { DieselpunkOptions } from "#src/models/kits/nod-krai/DieselpunkOptions";
import type { BufferGeometry } from "three";

import { createBoxesGeometry } from "#src/kits/architecture/createBoxesGeometry";
import { createLatheStackGeometry } from "#src/kits/architecture/createLatheStackGeometry";
import { mergeGeometryParts } from "#src/kits/mergeGeometryParts";
import { createPipeworkGeometry } from "#src/kits/nod-krai/createPipeworkGeometry";

const SMOKESTACK_RADIAL_SEGMENTS = 12;
// A dieselpunk structure as one geometry for one material: its boxes of sheds, plates and cranes, its pipework and its
// smokestacks. Every part is indexed, so the parts merge; a faceted stack would not
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
