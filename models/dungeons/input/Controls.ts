import type { BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import type { PlayerInput } from "@/models/dungeons/input/PlayerInput";
import type { InteractableDirection } from "@/models/dungeons/InteractableDirection";

export interface Controls {
  cursorKeys: BaseCursorKeys | null;
  input: PlayerInput | null;
  getInput: <T extends true | undefined>(justDown?: T) => T extends true ? InteractableDirection : PlayerInput;
  setInput: (input: PlayerInput) => void;
  resetInput: () => void;
}
