import { bookmarksInApp } from "@esposter/db-schema";

// The tables a delete's cascade reaches that its tombstones leave live, each with the reason. A bookmark names its room
// Or Resource only as the page it bookmarks, so it is its reader's row, and the purge's cascade removes it with its
// Target, As the overlay design's tombstones decision sets out
export const CASCADE_LEFT_TO_PURGE = [
  {
    reason: "a bookmark names its target only as the page it marks, so its cascade is the purge's",
    table: bookmarksInApp,
  },
] as const;
