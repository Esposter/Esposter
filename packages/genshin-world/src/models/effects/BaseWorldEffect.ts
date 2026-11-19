import type { WorldEffectKind } from "#src/models/effects/WorldEffectKind";
import type { GroundPoint } from "genshin-engine";

// A visual the world draws over its scene at a point of the ground, as a cast, a hit or a reaction starts it. Its life
// Runs down from the seconds it lasts, and it is dropped once that runs out
export interface BaseWorldEffect {
  // The damage a number effect shows, which no other kind carries
  damage?: number | undefined;
  kind: WorldEffectKind;
  // The ground point it shows at, a copy of the point it was given
  position: GroundPoint;
  // The seconds its whole life lasts, from which how far through it is read
  seconds: number;
  // The ground point it flies to over its life, a copy of the point it was given, and none for one that holds still
  target?: GroundPoint | undefined;
}
