// The names of an object's ancestors, from the root down to its father, read up the father links.
// A father with no dump to name it stops the walk, so a path reaches only as far as the dumps do
export const getUiPath = (
  fatherId: string,
  transformIdNameMap: ReadonlyMap<string, { fatherId: string; name: string }>,
): string[] => {
  const names: string[] = [];
  const visitedIds = new Set<string>();
  let currentId = fatherId;
  while (currentId && !visitedIds.has(currentId)) {
    const father = transformIdNameMap.get(currentId);
    if (!father) break;
    visitedIds.add(currentId);
    names.push(father.name);
    currentId = father.fatherId;
  }
  return names.toReversed();
};
