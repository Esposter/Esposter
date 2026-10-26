import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { GroundPoint } from "genshin-engine";

// A circle placed in the world by a character for the seconds left of it, which ticks on a schedule while the body stands
// Inside it and applies what its tick does to the character on the field
export interface KitField {
  centre: GroundPoint;
  characterId: number;
  // The name its character's kit finds it by among the team's effects, if the kit reads it again
  id?: string;
  // Whether the field moves with the body on the field, its centre standing where that body stands on each step
  isFollowing?: true;
  // Whether several fields of its name stand at once, each kept on its own as gcsim keeps a Sourcewater Droplet, so that a
  // Cast under the name does not restart the one standing
  isStacked?: true;
  kind: "field";
  nextTickSeconds: number;
  // What the field does with each event that reaches it, as the Starlight Prism counts the elements applied inside it
  onEvent?: (event: KitEvent, field: KitField) => void;
  // What the field does on each step while it stands, before its ticks, to the enemies it is over, given the field itself and
  // The seconds the step covers, which a rate on the field counts by
  onStep?: (context: KitContext, field: KitField, stepSeconds: number) => void;
  onTick: (context: KitContext, tickIndex: number) => void;
  radius: number;
  secondsRemaining: number;
  tickIndex: number;
  tickIntervalSeconds: number;
}
