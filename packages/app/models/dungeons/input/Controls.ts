import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";

export interface Controls {
  cursorKeys: BaseCursorKeys | null;
  getInput: (justDown?: true) => PlayerInput;
  input: null | PlayerInput;
  resetInput: () => void;
  setInput: (input: PlayerInput) => void;
}
