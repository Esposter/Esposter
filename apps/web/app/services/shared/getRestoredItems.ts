// The list a failed delete's rollback puts back: the one row it removed, where it stood — clamped, because the
// List can be shorter by the time the write is refused. A row already back is left alone, since something that
// Replaced the list mid-flight (a re-read, another device's content adopted) has re-read the row this delete never
// Removed on the server, and restoring it again would render it twice
export const getRestoredItems = <TItem extends { id: unknown }>(items: TItem[], restoredItem: TItem, index: number) =>
  items.some(({ id }) => id === restoredItem.id)
    ? items
    : items.toSpliced(Math.min(index, items.length), 0, restoredItem);
