// A text as the words it is made of, lowercased, apostrophes dropped so "Island's" reads as "islands", and padded with a
// Space at each end so a name is found only as whole words
const toWords = (text: string): string =>
  ` ${text
    .toLowerCase()
    .replaceAll(/['’]/gu, "")
    .replaceAll(/[^\p{L}\p{N}]+/gu, " ")
    .trim()} `;

// Each viewpoint's point of the official map, by the viewpoint's id: a point is a viewpoint's candidate when the text
// Written on it holds the viewpoint's name as whole words, and is taken by elimination. A viewpoint with one candidate
// That no other viewpoint with one candidate shares takes it, the point is struck from every other viewpoint's candidates,
// And the round repeats until none is taken. A viewpoint left with no candidate, or with several, is left unmatched
// Rather than guessed
export const matchViewpointPoints = (
  viewpointNameMap: ReadonlyMap<number, string>,
  pointContentMap: ReadonlyMap<number, string>,
): Map<number, number> => {
  const pointWordsMap = new Map(Array.from(pointContentMap, ([pointId, content]) => [pointId, toWords(content)]));
  const candidatesMap = new Map(
    Array.from(viewpointNameMap, ([viewpointId, name]) => {
      const nameWords = toWords(name);
      const pointIds = [...pointWordsMap].flatMap(([pointId, words]) =>
        nameWords.trim() !== "" && words.includes(nameWords) ? [pointId] : [],
      );
      return [viewpointId, new Set(pointIds)];
    }),
  );
  const viewpointPointIdMap = new Map<number, number>();
  let isTaken = true;
  while (isTaken) {
    const singleEntries = [...candidatesMap].flatMap(([viewpointId, pointIds]) => {
      const [pointId] = pointIds;
      return pointIds.size === 1 && pointId !== undefined ? [[viewpointId, pointId] as const] : [];
    });
    const takenEntries = singleEntries.filter(
      ([, pointId]) => singleEntries.filter(([, singlePointId]) => singlePointId === pointId).length === 1,
    );
    for (const [viewpointId, pointId] of takenEntries) {
      viewpointPointIdMap.set(viewpointId, pointId);
      candidatesMap.delete(viewpointId);
      for (const pointIds of candidatesMap.values()) pointIds.delete(pointId);
    }
    isTaken = takenEntries.length > 0;
  }
  return viewpointPointIdMap;
};
