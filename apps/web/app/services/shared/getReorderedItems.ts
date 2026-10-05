// The list with some of its rows in a new order: each takes the next of the places those rows held, so rows the order
// Leaves out — hidden by a search, or in another section — keep theirs. An id no longer in the list is passed over,
// Since something that replaced the list mid-flight has the last word on what is in it
export const getReorderedItems = <TItem extends { id: unknown }>(items: TItem[], orderedIds: TItem["id"][]) => {
  const idItemMap = new Map(items.map((item) => [item.id, item]));
  const orderedItems = orderedIds.flatMap((orderedId) => {
    const item = idItemMap.get(orderedId);
    return item ? [item] : [];
  });
  const orderedItemIds = new Set(orderedItems.map(({ id }) => id));
  let orderedIndex = 0;
  return items.map((item) => (orderedItemIds.has(item.id) ? (orderedItems[orderedIndex++] ?? item) : item));
};
