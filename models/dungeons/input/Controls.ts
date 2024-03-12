import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";

export interface Controls {
  cursorKeys: BaseCursorKeys | null;
  input: PlayerInput | null;
  isToggleMenuInput: () => boolean;
  getInput: (justDown?: true) => PlayerInput;
  setInput: (input: PlayerInput) => void;
  resetInput: () => void;
}
