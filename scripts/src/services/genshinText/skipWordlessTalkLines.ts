import type { Talk } from "genshin-world";

import { TalkLineKind } from "genshin-world";

// A talk with its wordless lines skipped. A spoken line the check finds no words for is one the game shows nothing of, a
// Step its scene acts on, so it is taken out and each line it followed goes on to its follower instead. A talk with a
// Wordless reply or a wordless line that branches cannot be read so, and neither can one left with no line: each is none
export const skipWordlessTalkLines = (talk: Talk, checkHasWords: (textId: string) => boolean): Talk | undefined => {
  const wordlessLines = talk.lines.filter(({ textId }) => !checkHasWords(textId));
  if (wordlessLines.some(({ kind, nextLineIds }) => kind === TalkLineKind.Choice || nextLineIds.length > 1))
    return undefined;
  const wordlessNextLineIdMap = new Map(wordlessLines.map(({ id, nextLineIds }) => [id, nextLineIds[0] ?? ""]));
  // The worded line a line leads to through the wordless ones, "" where they lead nowhere or round in a loop
  const resolveLineId = (lineId: string) => {
    const passedLineIds = new Set<string>();
    let resolvedLineId = lineId;
    while (wordlessNextLineIdMap.has(resolvedLineId) && !passedLineIds.has(resolvedLineId)) {
      passedLineIds.add(resolvedLineId);
      resolvedLineId = wordlessNextLineIdMap.get(resolvedLineId) ?? "";
    }
    return wordlessNextLineIdMap.has(resolvedLineId) ? "" : resolvedLineId;
  };
  const startLineId = resolveLineId(talk.startLineId);
  if (!startLineId) return undefined;
  return {
    ...talk,
    lines: talk.lines
      .filter(({ id }) => !wordlessNextLineIdMap.has(id))
      .map((line) => ({
        ...line,
        nextLineIds: [
          ...new Set(
            line.nextLineIds.flatMap((nextLineId) => {
              const resolvedLineId = resolveLineId(nextLineId);
              return resolvedLineId ? [resolvedLineId] : [];
            }),
          ),
        ],
      })),
    startLineId,
  };
};
