import type { CharacterConfig } from "#src/models/CharacterConfig";
import type { CharacterState } from "#src/models/CharacterState";
import type { Direction } from "#src/models/Direction";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { GridEngineEvents } from "#src/models/GridEngineEvents";
import type { Position } from "#src/models/Position";
import type { Result } from "neverthrow";

// A grid of tiles with characters on it. Calls that can fail return a result, and queries that cannot return a value
export interface GridEngine {
  addCharacter: (config: CharacterConfig) => Result<void, GridEngineError>;
  checkHasCharacter: (id: string) => boolean;
  checkIsBlocked: (position: Position) => boolean;
  move: (id: string, direction: Direction) => Result<void, GridEngineError>;
  on: <TEvent extends keyof GridEngineEvents>(
    event: TEvent,
    listener: (payload: GridEngineEvents[TEvent]) => void,
  ) => () => void;
  readCharacter: (id: string) => Result<CharacterState, GridEngineError>;
  setPosition: (id: string, position: Position) => Result<void, GridEngineError>;
  turnTowards: (id: string, direction: Direction) => Result<void, GridEngineError>;
  update: (delta: number) => void;
}
