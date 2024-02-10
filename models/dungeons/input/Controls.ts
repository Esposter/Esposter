import { type BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import { type PlayerInput } from "@/models/dungeons/input/PlayerInput";

export interface Controls {
  cursorKeys: BaseCursorKeys;
  input: PlayerInput | null;
  getInput: () => PlayerInput;
  setInput: (input: PlayerInput) => void;
  destroy: () => void;
}
