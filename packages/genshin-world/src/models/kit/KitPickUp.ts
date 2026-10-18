import type { KitContext } from "#src/models/kit/KitContext";
import type { GroundPoint } from "genshin-engine";

// A pick-up a character's kit leaves in the world for the seconds left of it, which the character on the field picks up
// By walking within its radius once it may be, as a gcsim gadget the player collides with is picked up. Picking it up
// Takes it off the team's effects and does what its kit gives it to do; one never picked up runs out, which its kit
// Hears as the effect expiring
export interface KitPickUp {
  characterId: number;
  // The name its character's kit finds it by among the team's effects
  id: string;
  kind: "pickUp";
  // What picking it up does, given the combat state the character on the field picked it up in and the pick-up itself
  onPickedUp: (context: KitContext, pickUp: KitPickUp) => void;
  // The seconds left of it from which it may be picked up: its full seconds less the delay before it may be
  pickableSeconds: number;
  position: GroundPoint;
  radius: number;
  secondsRemaining: number;
}
