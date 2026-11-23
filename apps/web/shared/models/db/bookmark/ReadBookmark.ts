import type { BookmarkPageLink } from "#shared/models/app/BookmarkPageLink";
import type { BookmarkInApp } from "@esposter/db-schema";

// A bookmark row as the read answers it: the row the overlay holds, a removed one included, with the link fields the
// Read Joins in from other tables. Those fields are kept beside the row, so the row is the only thing the overlay holds
export type ReadBookmark = BookmarkInApp & Pick<BookmarkPageLink, "isAvailable" | "mark">;
