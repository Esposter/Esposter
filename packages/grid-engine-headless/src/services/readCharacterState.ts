import type { CharacterState } from "#src/models/CharacterState";
import type { GridEngineError } from "#src/models/GridEngineError";
import type { GridEngineState } from "#src/models/GridEngineState";
import type { Result } from "neverthrow";

import { readCharacter } from "#src/services/readCharacter";

// The reader's view of a character: a step's progress is zero when no step is under way, and the position is copied so
// A reader cannot move the character by writing to it
export const readCharacterState = (state: GridEngineState, id: string): Result<CharacterState, GridEngineError> =>
  readCharacter(state, id).map((character) => ({
    facingDirection: character.facingDirection,
    position: { x: character.position.x, y: character.position.y },
    progress: character.step?.progress ?? 0,
  }));
