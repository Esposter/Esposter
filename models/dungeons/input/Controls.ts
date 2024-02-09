import { type BaseCursorKeys } from "@/models/dungeons/input/BaseCursorKeys";
import { type PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { type Direction } from "grid-engine";

export interface Controls {
  cursorKeys: BaseCursorKeys;
  getInput: () => PlayerSpecialInput | Direction;
  destroy: () => void;
}
