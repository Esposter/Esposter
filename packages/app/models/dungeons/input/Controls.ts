import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

export interface Controls {
  cursorKeys?: BaseCursorKeys;
  getInput: (justDown?: true) => PlayerInput;
  input?: PlayerInput;
  resetInput: () => void;
  setInput: (input: PlayerInput) => void;
}
