import { NotFoundError } from "@esposter/shared";

// The game's content lives in flat asset arrays keyed by a tiled id, so every lookup is a find-or-throw
export const getById = <TId extends string, TItem extends { id: TId }>(items: TItem[], id: TId, readerName: string) => {
  const item = items.find((currentItem) => currentItem.id === id);
  if (!item) throw new NotFoundError(readerName, id);
  return item;
};
