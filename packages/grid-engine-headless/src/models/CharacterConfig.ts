import type { Direction } from "#src/models/Direction";
import type { Position } from "#src/models/Position";

// What a character starts with. An absent field takes its default: the origin, facing down, and four tiles a second
export interface CharacterConfig {
  facingDirection?: Direction;
  id: string;
  speed?: number;
  startPosition?: Position;
}
