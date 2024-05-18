import type { BaseCursorKeys } from "@/lib/phaser/models/input/BaseCursorKeys";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";

export interface Controls {
  cursorKeys: BaseCursorKeys | null;
  input: PlayerInput | null;
  getInput: (justDown?: true) => PlayerInput;
  setInput: (input: PlayerInput) => void;
  resetInput: () => void;
}
