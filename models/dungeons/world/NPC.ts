import { type Character } from "@/models/dungeons/world/Character";
import { type Direction, type Position, type WalkingAnimationMapping } from "grid-engine";

export interface Npc extends Character {
  walkingAnimationMapping: WalkingAnimationMapping;
  position: Position;
  direction: Direction;
  // Some spritesheets may only animate one side and rely on us to flipX
  flipX?: true;
}
