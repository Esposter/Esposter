import type { InstanceCulling } from "#src/models/culling/InstanceCulling";
import type { PlantCullingOptions } from "#src/models/culling/PlantCullingOptions";

import { CULLING_MATRIX_COLUMN_COUNT } from "#src/culling/constants";
import { createFrustumVisibility } from "#src/culling/createFrustumVisibility";
import { createInstanceCulling } from "#src/culling/createInstanceCulling";
import { createInstanceMatrixNode } from "#src/culling/createInstanceMatrixNode";
import { distance, max, step, vec4 } from "three/tsl";

// The cull of one kind of plant, the grass cull's own pass over each place's matrix: a place is drawn when its base stands
// Within the draw distance of the eye and a point of its box stands in the view. The base and top of the box's centre line
// And its four sides at mid height are each tested, since a card or a dome in view by any of them is kept
export const createPlantCulling = ({
  attribute,
  bounds: { bottom, halfWidth, height },
  clipFromModel,
  drawDistance,
  eye,
  indexCount,
}: PlantCullingOptions): InstanceCulling => {
  const middle = bottom + height / 2;
  const boxPoints: [number, number, number][] = [
    [0, bottom, 0],
    [0, bottom + height, 0],
    [halfWidth, middle, 0],
    [-halfWidth, middle, 0],
    [0, middle, halfWidth],
    [0, middle, -halfWidth],
  ];
  return createInstanceCulling({
    count: attribute.count / CULLING_MATRIX_COLUMN_COUNT,
    indexCount,
    isVisible: (instance) => {
      const instanceMatrix = createInstanceMatrixNode(attribute, instance);
      const isNear = step(distance(instanceMatrix.mul(vec4(0, 0, 0, 1)).xyz, eye), drawDistance);
      const isInView = boxPoints
        .map(([x, y, z]) => createFrustumVisibility(clipFromModel, instanceMatrix.mul(vec4(x, y, z, 1)).xyz))
        .reduce((visible, point) => max(visible, point));
      return isInView.mul(isNear);
    },
  });
};
