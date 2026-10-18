import type { GrassCell } from "#src/models/vegetation/GrassCell";
import type { GrassCellOptions } from "#src/models/vegetation/GrassCellOptions";

import { sampleGroundCapture } from "#src/nodes/sampleGroundCapture";
import { float, hash, smoothstep, step, vec2 } from "three/tsl";

// How green a ground colour must be, its green over its red and blue, for grass to grow on it rather than rock or sand
const MIN_GREENNESS = 0.05;

// A cell of a grass ring: its place in the grid centred on the camera, moving in whole cells so blades stay put in the
// world, a hash of the cell jittering it, turning it, sizing it and deciding whether the tier grows it. It grows only on
// green ground above the water, and fades out over its ring's distances. Shared by the blades' draw and the culling pass
// that picks which of them to draw, so both read one cell the same way
export const createGrassCell = ({
  cameraGround,
  density,
  groundCapture,
  index,
  ring,
  waterUniforms,
}: GrassCellOptions): GrassCell => {
  const { cellsPerSide, fadeEnd, fadeStart, innerRadius, scale, spacing } = ring;
  const row = index.div(cellsPerSide).floor();
  const column = index.sub(row.mul(cellsPerSide));
  const gridOrigin = cameraGround.div(spacing).floor().mul(spacing);
  const cell = vec2(column, row)
    .sub(cellsPerSide / 2)
    .mul(spacing)
    .add(gridOrigin);
  const seed = cell.x.mul(127.1).add(cell.y.mul(311.7));
  const ground = cell.add(
    vec2(hash(seed), hash(seed.add(1)))
      .sub(0.5)
      .mul(spacing),
  );
  const { captured, isInsideCapture } = sampleGroundCapture(groundCapture, ground);
  const greenness = captured.g.sub(captured.r.max(captured.b));
  const isGrown = isInsideCapture
    .mul(step(MIN_GREENNESS, greenness))
    .mul(step(waterUniforms.level, captured.a))
    .mul(step(hash(seed.add(2)), density));
  const distance = ground.distance(cameraGround);
  const fade = smoothstep(innerRadius, innerRadius + spacing * 4, distance).mul(
    float(1).sub(smoothstep(fadeStart, fadeEnd, distance)),
  );
  const size = hash(seed.add(3)).mul(0.5).add(0.75).mul(fade).mul(isGrown).mul(scale);
  const angle = hash(seed.add(4)).mul(Math.PI * 2);
  return { angle, captured, ground, size };
};
