import type { KitContext } from "#src/models/kit/KitContext";
import type { GroundPoint } from "genshin-engine";

// A circle placed in the world by a character for the seconds left of it, which ticks on a schedule while the body stands
// Inside it and applies what its tick does to the character on the field
export interface KitField {
  centre: GroundPoint;
  characterId: number;
  // The factor the cooldown of a skill or a burst cast inside it is multiplied by, if it lowers them
  cooldownMultiplier?: number;
  // The name its character's kit finds it by among the team's effects, if the kit reads it again
  id?: string;
  // Whether the field moves with the body on the field, its centre standing where that body stands on each step
  isFollowing?: true;
  kind: "field";
  nextTickSeconds: number;
  // What the field does on each step while it stands, before its ticks, to the enemies it is over, given the field itself
  onStep?: (context: KitContext, field: KitField) => void;
  onTick: (context: KitContext, tickIndex: number) => void;
  radius: number;
  secondsRemaining: number;
  tickIndex: number;
  tickIntervalSeconds: number;
}
