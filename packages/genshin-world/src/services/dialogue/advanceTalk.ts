import type { Talk } from "#src/models/dialogue/Talk";
import type { TalkProgress } from "#src/models/dialogue/TalkProgress";

import { getTalkChoices } from "#src/services/dialogue/getTalkChoices";
import { getTalkLine } from "#src/services/dialogue/getTalkLine";

// What a click, F or Space does to a talk, as the game's do: a line still being written out is shown whole, a whole
// Line goes on to the next, the first of them where the game would pick by a quest's state, and the talk ends after a
// Line nothing follows. A line offering replies waits for one to be chosen, and an ended talk stays ended
export const advanceTalk = (talk: Talk, progress: TalkProgress): TalkProgress => {
  if (!progress.lineId) return progress;
  else if (!progress.isRevealed) return { ...progress, isRevealed: true };
  else if (getTalkChoices(talk, progress.lineId).length > 0) return progress;
  const { nextLineIds } = getTalkLine(talk, progress.lineId);
  return { isRevealed: false, lineId: nextLineIds[0] ?? "" };
};
