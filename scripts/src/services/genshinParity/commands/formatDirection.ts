import type { Vector } from "#src/models/shared/Vector";

export const formatDirection = (direction: Readonly<Vector>): string =>
  `[${direction.map((value) => value.toFixed(3)).join(", ")}]`;
