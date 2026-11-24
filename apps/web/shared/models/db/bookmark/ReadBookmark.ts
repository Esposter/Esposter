import type { BookmarkPageLink } from "#shared/models/app/BookmarkPageLink";
import type { BookmarkInApp } from "@esposter/db-schema";

// A bookmark row as the read answers it: the row the overlay holds, a removed one included.
// The link fields the read joins in from other tables sit beside the row.
// So the row is the only thing the overlay holds
export type ReadBookmark = BookmarkInApp & Pick<BookmarkPageLink, "isAvailable" | "mark">;
