import type { Talk } from "#src/models/dialogue/Talk";
import type { TalkLine } from "#src/models/dialogue/TalkLine";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A talk's line by its id, which a talk that names a line it does not hold breaks
export const getTalkLine = (talk: Talk, lineId: string): TalkLine => {
  const talkLine = talk.lines.find(({ id }) => id === lineId);
  if (!talkLine) throw new InvalidOperationError(Operation.Read, talk.id, `has no line ${lineId}`);
  return talkLine;
};
