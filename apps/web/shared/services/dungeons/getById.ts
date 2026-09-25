import { NotFoundError } from "@esposter/shared";

// The game's content lives in flat asset arrays keyed by a tiled id, so every lookup is a find-or-throw. It hands
// Out a copy rather than the definition itself: callers go on to give what they looked up a quantity, a position or
// A state of their own, and writing that onto the definition would reach everything built from it afterwards
export const getById = <TId extends string, TItem extends { id: TId }>(items: TItem[], id: TId, readerName: string) => {
  const item = items.find((currentItem) => currentItem.id === id);
  if (!item) throw new NotFoundError(readerName, id);
  return structuredClone(item);
};
