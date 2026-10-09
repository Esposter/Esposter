import type { KitFieldTick } from "#src/models/kit/KitFieldTick";
import type { GroundPoint } from "genshin-engine";

// A circle placed in the world for the seconds left of it, which ticks on a schedule while the body stands inside it and
// Applies what its tick does to the character on the field
export interface KitField {
  centre: GroundPoint;
  kind: "field";
  nextTickSeconds: number;
  onTick: (tick: KitFieldTick) => void;
  radius: number;
  secondsRemaining: number;
  tickIndex: number;
  tickIntervalSeconds: number;
}
