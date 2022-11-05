import { FETCH_LIMIT } from "@/util/constants.common";

export const getNextCursor = <T extends object, U extends keyof T>(items: T[], itemCursorKey: U) => {
  let nextCursor: T[U] | null = null;
  if (items.length > FETCH_LIMIT) {
    const nextItem = items.pop();
    if (nextItem) nextCursor = nextItem[itemCursorKey];
  }
  return nextCursor;
};
