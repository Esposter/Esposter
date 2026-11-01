// Each new id goes after the nearest id before it in the references' order that the report already lists, so it lands
// Where a full run would put it
export const placeNewIds = (
  ids: readonly string[],
  newIds: readonly string[],
  referenceIds: readonly string[],
): string[] =>
  newIds.reduce(
    (order, newId) => {
      const predecessor = referenceIds.slice(0, referenceIds.indexOf(newId)).findLast((id) => order.includes(id));
      return order.toSpliced(predecessor === undefined ? 0 : order.indexOf(predecessor) + 1, 0, newId);
    },
    [...ids],
  );
