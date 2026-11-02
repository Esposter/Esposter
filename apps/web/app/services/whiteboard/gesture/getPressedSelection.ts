// The selection a press on an element leaves: a press on an element already selected keeps the selection, and any other press selects
// The element alone, or adds it to the selection under shift
export const getPressedSelection = (selectedIds: string[], elementId: string, isAdditive: boolean): string[] => {
  if (selectedIds.includes(elementId)) return selectedIds;

  return isAdditive ? [...selectedIds, elementId] : [elementId];
};
