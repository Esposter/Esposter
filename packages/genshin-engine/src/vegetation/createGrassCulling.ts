import type { GrassRing } from "#src/models/vegetation/GrassRing";
import type { GroundCapture } from "#src/models/vegetation/GroundCapture";
import type { WaterUniforms } from "#src/models/water/WaterUniforms";
import type { InstanceCulling } from "#src/models/culling/InstanceCulling";
import type { Matrix4, Vector2 } from "three";
import type { UniformNode } from "three/webgpu";

import { CULLING_MIN_SIZE } from "#src/culling/constants";
import { createFrustumVisibility } from "#src/culling/createFrustumVisibility";
import { createInstanceCulling } from "#src/culling/createInstanceCulling";
import { computeGrassBlade } from "#src/vegetation/computeGrassBlade";
import { createGrassCell } from "#src/vegetation/createGrassCell";
import { max, step, vec3 } from "three/tsl";

export interface GrassCullingOptions {
  // A near-ring blade's height, in metres
  bladeHeight: number;
  // The model-to-clip matrix of the ring's mesh, which the view's frustum is tested in
  clipFromModel: UniformNode<"mat4", Matrix4>;
  cameraGround: UniformNode<"vec2", Vector2>;
  density: UniformNode<"float", number>;
  groundCapture: GroundCapture;
  // The blades' segments a side, which fix the blade's index count the draw takes
  segmentCount: number;
  ring: GrassRing;
  waterUniforms: Pick<WaterUniforms, "level">;
}

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
