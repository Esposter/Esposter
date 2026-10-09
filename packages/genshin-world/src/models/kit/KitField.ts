import type { KitFieldTick } from "#src/models/kit/KitFieldTick";
import type { GroundPoint } from "genshin-engine";

// A circle placed in the world by a character for the seconds left of it, which ticks on a schedule while the body stands
// Inside it and applies what its tick does to the character on the field
export interface KitField {
  centre: GroundPoint;
  characterId: number;
  kind: "field";
  nextTickSeconds: number;
  onTick: (tick: KitFieldTick) => void;
  radius: number;
  secondsRemaining: number;
  tickIndex: number;
  tickIntervalSeconds: number;
}
