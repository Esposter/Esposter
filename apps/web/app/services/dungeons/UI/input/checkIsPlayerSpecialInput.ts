import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";

import { PlayerSpecialInputs } from "@/models/dungeons/UI/input/PlayerSpecialInput";

// The set holds the narrow type, and `has` only accepts its own element type — asking it about the wider
// Input is the whole point of this predicate
export const checkIsPlayerSpecialInput = (input: PlayerInput): input is PlayerSpecialInput =>
  PlayerSpecialInputs.has(input as PlayerSpecialInput);
