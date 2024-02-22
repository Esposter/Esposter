import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";

export interface Controls {
  cursorKeys: BaseCursorKeys | null;
  input: PlayerInput | null;
  getInput: () => PlayerInput;
  setInput: (input: PlayerInput) => void;
}
