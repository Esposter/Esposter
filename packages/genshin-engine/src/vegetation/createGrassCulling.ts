import type { InstanceCulling } from "#src/models/culling/InstanceCulling";
import type { GrassCullingOptions } from "#src/models/vegetation/GrassCullingOptions";
import type { Node } from "three/webgpu";

import { CULLING_MIN_SIZE } from "#src/culling/constants";
import { createFrustumVisibility } from "#src/culling/createFrustumVisibility";
import { createInstanceCulling } from "#src/culling/createInstanceCulling";
import { computeGrassBlade } from "#src/vegetation/computeGrassBlade";
import { createGrassBladePoint } from "#src/vegetation/createGrassBladePoint";
import { createGrassCell } from "#src/vegetation/createGrassCell";
import { float, max, step, vec2, vec3 } from "three/tsl";

// The cull of one grass ring: each cell is drawn only when it grows a blade within the view. A blade's root, its top as
// it stands and its tip as the wind and the trail bend it are each tested, since a blade can stand in view by any of them:
// a tip the bend carries in can be in view while its root and unbent top lie outside it. The survivors feed the ring's
// material, which draws the same points
export const createGrassCulling = ({
  bladeHeight,
  cameraGround,
  clipFromModel,
  density,
  groundCapture,
  grassTrail,
  ring,
  segmentCount,
  waterUniforms,
  windUniforms,
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
      const isInView = (up: Node<"float">) =>
        createFrustumVisibility(
          clipFromModel,
          createGrassBladePoint({ bladeHeight, captured, ground, grassTrail, offset: vec2(0), size, up, windUniforms }),
        );
      const root = isInView(float(0));
      const tip = isInView(float(1));
      const top = createFrustumVisibility(
        clipFromModel,
        vec3(ground.x, captured.a.add(size.mul(bladeHeight)), ground.y),
      );
      return step(CULLING_MIN_SIZE, size).mul(max(max(root, top), tip));
    },
  });
