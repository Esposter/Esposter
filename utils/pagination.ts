export const FETCH_LIMIT = 20;

export const getNextCursor = <T extends object, U extends keyof T>(
  items: T[],
  itemCursorKey: U,
  fetchLimit: number
) => {
  let nextCursor: T[U] | null = null;
  if (items.length > fetchLimit) {
    const nextItem = items.pop();
    if (nextItem) nextCursor = nextItem[itemCursorKey];
  }
  return nextCursor;
};
