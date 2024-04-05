export const mapIds = <TId, TItem>(ids: TId[], mapper: (id: TId) => TItem | undefined) => {
  const items: TItem[] = [];
  for (const id of ids) {
    const item = mapper(id);
    if (!item) continue;
    items.push(item);
  }
  return items;
};
