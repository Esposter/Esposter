import type { InstanceCulling } from "#src/models/culling/InstanceCulling";
import type { GrassCullingOptions } from "#src/models/vegetation/GrassCullingOptions";

import { CULLING_MIN_SIZE } from "#src/culling/constants";
import { createFrustumVisibility } from "#src/culling/createFrustumVisibility";
import { createInstanceCulling } from "#src/culling/createInstanceCulling";
import { computeGrassBlade } from "#src/vegetation/computeGrassBlade";
import { createGrassCell } from "#src/vegetation/createGrassCell";
import { max, step, vec3 } from "three/tsl";

// The cull of one grass ring: each cell is drawn only when it grows a blade within the view, a blade's root and its top
// both tested, since a blade can stand in view by its top alone. The survivors feed the ring's material
export const createGrassCulling = ({
  bladeHeight,
  cameraGround,
  clipFromModel,
  density,
  groundCapture,
  ring,
  segmentCount,
  waterUniforms,
}: GrassCullingOptions): InstanceCulling =>
  createInstanceCulling({
    count: ring.cellsPerSide * ring.cellsPerSide,
    indexCount: computeGrassBlade(segmentCount).indices.length,
    isVisible: (index) => {
      const { captured, ground, size } = createGrassCell({
        cameraGround,
        density,
        groundCapture,
        index,
        ring,
        waterUniforms,
      });
      const root = createFrustumVisibility(clipFromModel, vec3(ground.x, captured.a, ground.y));
      const top = createFrustumVisibility(
        clipFromModel,
        vec3(ground.x, captured.a.add(size.mul(bladeHeight)), ground.y),
      );
      return step(CULLING_MIN_SIZE, size).mul(max(root, top));
    },
  });
