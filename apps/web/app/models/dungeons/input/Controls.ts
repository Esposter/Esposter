import type { BaseCursorKeys } from "#src/models/dungeons/input/BaseCursorKeys";
import type { PlayerInput } from "#src/models/dungeons/UI/input/PlayerInput";

export interface Controls {
  cursorKeys?: BaseCursorKeys;
  getInput: (isJustDown?: true) => PlayerInput;
  input?: PlayerInput;
  resetInput: () => void;
  setInput: (input: PlayerInput) => void;
}
