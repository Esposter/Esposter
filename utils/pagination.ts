export const READ_LIMIT = 15;

export const getNextCursor = <T extends object, U extends keyof T>(items: T[], itemCursorKey: U, readLimit: number) => {
  let nextCursor: T[U] | null = null;
  if (items.length > readLimit) {
    const nextItem = items.pop();
    if (nextItem) nextCursor = nextItem[itemCursorKey];
  }
  return nextCursor;
};
