// The order-insensitive watch key for id-list-scoped subscriptions.
export const getIdsKey = (items: { id: string }[]) =>
  items
    .map(({ id }) => id)
    .toSorted()
    .join(",");
