import type { GameText } from "genshin-text";

import { SECONDS_PER_MINUTE } from "#src/services/time/constants";
import { fillGameTextValues, GameTextKey } from "genshin-text";

// A duration in the game's minute words, whole minutes and never fewer than one: the game's text holds no seconds unit,
// So a time under a minute reads as one minute
export const formatForgeTime = (gameText: GameText, seconds: number) =>
  fillGameTextValues(
    gameText[GameTextKey.WishTimeRemainingMinutes],
    Math.max(1, Math.floor(seconds / SECONDS_PER_MINUTE)),
  );
