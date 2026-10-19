import type { GrassTrail } from "#src/models/vegetation/GrassTrail";
import type { WindUniforms } from "#src/models/wind/WindUniforms";
import type { Node } from "three/webgpu";

import { createWindNode } from "#src/nodes/createWindNode";
import { sampleGrassTrail } from "#src/nodes/sampleGrassTrail";
import { GRASS_BEND_PER_WIND, GRASS_DIP_PER_BEND, GRASS_TRAIL_BEND_SHARE } from "#src/vegetation/constants";
import { vec3 } from "three/tsl";

interface GrassBladePointOptions {
  // The blade's full height in metres, which its height share is taken of
  bladeHeight: number;
  // Where the blade's cell stands: its footing on the ground and the ground's height under it
  captured: Node<"vec4">;
  grassTrail: GrassTrail;
  ground: Node<"vec2">;
  // The blade's offset across the ground at its height share, a point's share of its width turned by its angle
  offset: Node<"vec2">;
  size: Node<"float">;
  // The share of the blade's height the point stands at: zero at its root and one at its tip
  up: Node<"float">;
  windUniforms: WindUniforms;
}

// A point on a blade, bent by the wind and the grass trail by the square of its height, so the root stays planted and the
// Top travels and dips as it bends. The blade's draw places its vertices with it and the culling pass tests the same
// Points, so a tip the bend carries into view is the one drawn
export const createGrassBladePoint = ({
  bladeHeight,
  captured,
  grassTrail,
  ground,
  offset,
  size,
  up,
  windUniforms,
}: GrassBladePointOptions): Node<"vec3"> => {
  const bend = up.mul(up);
  const wind = createWindNode(windUniforms, ground).mul(GRASS_BEND_PER_WIND).mul(bend);
  const trailBend = sampleGrassTrail(grassTrail, ground).mul(GRASS_TRAIL_BEND_SHARE).mul(bend);
  const trailOffset = trailBend.mul(bladeHeight).mul(size);
  const height = up
    .mul(bladeHeight)
    .mul(size)
    .sub(wind.length().mul(bladeHeight).mul(size).mul(GRASS_DIP_PER_BEND))
    .sub(trailBend.length().mul(bladeHeight).mul(size).mul(GRASS_DIP_PER_BEND));
  return vec3(
    ground.x.add(offset.x).add(wind.x.mul(bladeHeight).mul(size)).add(trailOffset.x),
    captured.a.add(height),
    ground.y.add(offset.y).add(wind.y.mul(bladeHeight).mul(size)).add(trailOffset.y),
  );
};
