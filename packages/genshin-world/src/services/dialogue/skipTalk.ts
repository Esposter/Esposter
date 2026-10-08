import type { Talk } from "#src/models/dialogue/Talk";
import type { TalkProgress } from "#src/models/dialogue/TalkProgress";

import { getTalkChoices } from "#src/services/dialogue/getTalkChoices";
import { getTalkLine } from "#src/services/dialogue/getTalkLine";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Skip runs a talk on to the next line that asks the Traveler for a reply, written out whole, or to its end, so a skip
// Never answers for the player. A talk whose lines loop back with no reply between them never gets there, which the
// Graph has wrong
export const skipTalk = (talk: Talk, { lineId }: TalkProgress): TalkProgress => {
  const skippedLineIds = new Set<string>();
  let skippedLineId = lineId;
  while (skippedLineId && getTalkChoices(talk, skippedLineId).length === 0) {
    if (skippedLineIds.has(skippedLineId))
      throw new InvalidOperationError(Operation.Read, talk.id, `loops back to line ${skippedLineId} with no reply`);
    skippedLineIds.add(skippedLineId);
    skippedLineId = getTalkLine(talk, skippedLineId).nextLineIds[0] ?? "";
  }
  return { isRevealed: Boolean(skippedLineId), lineId: skippedLineId };
};
