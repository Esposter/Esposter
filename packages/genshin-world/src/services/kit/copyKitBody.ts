import type { KitBody } from "#src/models/kit/KitBody";

// A copy of a body as it stands, its position copied too, so it stays where it was once the body on the field moves on. The
// Body a step hands its kit shares the controller's own position, which moves in place
export const copyKitBody = ({ facing, height, position }: KitBody): KitBody => ({
  facing,
  height,
  position: { x: position.x, z: position.z },
});
