import type { Vector } from "#src/models/shared/Vector";

export const toHex = (colour: Vector): string =>
  `#${colour.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
