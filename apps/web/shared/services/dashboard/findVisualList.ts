import { listVisuals } from "#shared/services/dashboard/listVisuals";

// The list holding a visual id, with the group owning that list, which is none for the dashboard's own list. An id is
// Unique across the tree, so at most one list holds it
export const findVisualList = <TVisual extends { id: string; visuals?: TVisual[] }>(
  visuals: TVisual[],
  id: TVisual["id"],
) => {
  const lists = [
    { group: undefined, visuals },
    ...listVisuals(visuals).flatMap((group) => (group.visuals ? [{ group, visuals: group.visuals }] : [])),
  ];
  return lists.find((list) => list.visuals.some((visual) => visual.id === id));
};
