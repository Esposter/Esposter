import type { BaseCursorKeys } from "@/lib/phaser/models/input/BaseCursorKeys";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

export interface Controls {
  cursorKeys: BaseCursorKeys | null;
  getInput: (justDown?: true) => PlayerInput;
  input: null | PlayerInput;
  resetInput: () => void;
  setInput: (input: PlayerInput) => void;
}
