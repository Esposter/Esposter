import { type Character } from "@/models/dungeons/world/Character";
import { type Position, type WalkingAnimationMapping } from "grid-engine";

export interface NPC extends Character {
  walkingAnimationMapping: WalkingAnimationMapping;
  startPosition: Position;
}
