import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";

import { PlayerSpecialInputs } from "@/models/dungeons/UI/input/PlayerSpecialInput";

// The set holds the narrow type, and `has` only accepts its own element type. Read as the wider Input, it takes any
// Input, and a member of the set is a special input whatever type it was asked with
const PLAYER_SPECIAL_INPUT_SET: ReadonlySet<PlayerInput> = PlayerSpecialInputs;

export const checkIsPlayerSpecialInput = (input: PlayerInput): input is PlayerSpecialInput =>
  PLAYER_SPECIAL_INPUT_SET.has(input);
