import type { Talk } from "#src/models/dialogue/Talk";
import type { TalkProgress } from "#src/models/dialogue/TalkProgress";

import { getTalkChoices } from "#src/services/dialogue/getTalkChoices";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One of the replies on offer chosen: the talk goes on down its branch, or ends where nothing follows it. A reply
// Followed straight by more replies stays on screen as the Traveler's own line while the next ones are offered
export const chooseTalkLine = (talk: Talk, progress: TalkProgress, choiceLineId: string): TalkProgress => {
  const choiceTalkLine = getTalkChoices(talk, progress.lineId).find(({ id }) => id === choiceLineId);
  if (!choiceTalkLine)
    throw new InvalidOperationError(Operation.Update, talk.id, `line ${progress.lineId} offers no ${choiceLineId}`);
  else if (getTalkChoices(talk, choiceTalkLine.id).length > 0) return { isRevealed: true, lineId: choiceTalkLine.id };
  return { isRevealed: false, lineId: choiceTalkLine.nextLineIds[0] ?? "" };
};
