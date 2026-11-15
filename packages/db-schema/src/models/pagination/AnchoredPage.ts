import type { Page } from "#src/models/pagination/Page";

// A list opened at one of its items, read both ways: `nextCursor` continues past the last item and `previousCursor` back
// Before the first, each "" at its end of the list
export interface AnchoredPage<TItem> extends Page<TItem> {
  previousCursor: string;
}
