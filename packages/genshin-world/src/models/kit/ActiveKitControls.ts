import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { OreHit } from "#src/models/gathering/OreHit";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitHit } from "#src/models/kit/KitHit";
import type { PuzzleHit } from "#src/models/puzzle/PuzzleHit";
import type { CharacterController } from "genshin-engine";

// What the step of the kit on the field reads of the character it moves, beyond the combat state: the controller whose
// Body it acts from and turns, the camera's aim, the buffer its landed hits are written into, and where the ores its hits
// And reactions strike are sent
export interface ActiveKitControls {
  // The yaw the camera aims along, which an aimed shot turns the body to while the aim is held
  aimYaw: number;
  characterController: CharacterController;
  isAimHeld: boolean;
  // The buffer the step's landed hits are written into, emptied once they have struck
  landedHits: KitHit[];
  // A reaction a hit or a tick triggered on an enemy, sent to the world once the step's strikes have landed
  triggerReaction: (enemy: Enemy, reactions: Reaction[]) => void;
  // An ore struck by a hit the step landed or a reaction's explosion, from the body its area is drawn from
  strikeOre: (body: KitBody, hit: OreHit) => void;
  // A puzzle struck by a hit the step landed, from the body its area is drawn from
  strikePuzzle: (body: KitBody, hit: PuzzleHit) => void;
}
