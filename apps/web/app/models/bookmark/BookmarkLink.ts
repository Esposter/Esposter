import type { BookmarkPageLink } from "#shared/models/app/BookmarkPageLink";

// The fields a read joins in from other tables, kept beside the row by its path: whether the page is reachable, and the
// Mark that names it. A row the read did not join is drawn as reachable with no mark
export interface BookmarkLink {
  isAvailable?: boolean;
  mark?: BookmarkPageLink["mark"];
}
