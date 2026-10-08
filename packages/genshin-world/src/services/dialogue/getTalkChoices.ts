import type { ChoiceTalkLine } from "#src/models/dialogue/ChoiceTalkLine";
import type { Talk } from "#src/models/dialogue/Talk";

import { TalkLineKind } from "#src/models/dialogue/TalkLineKind";
import { getTalkLine } from "#src/services/dialogue/getTalkLine";

// The Traveler's replies a line offers: those of its next lines that are choices, none when the talk only goes on
export const getTalkChoices = (talk: Talk, lineId: string): ChoiceTalkLine[] =>
  getTalkLine(talk, lineId)
    .nextLineIds.map((nextLineId) => getTalkLine(talk, nextLineId))
    .filter((talkLine) => talkLine.kind === TalkLineKind.Choice);
