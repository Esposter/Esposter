import type { Page } from "#src/models/pagination/Page";

// A list with nothing read yet, or nothing in it: no items and no cursor to continue from
export const createEmptyPage = <TItem>(): Page<TItem> => ({ items: [], nextCursor: "" });
