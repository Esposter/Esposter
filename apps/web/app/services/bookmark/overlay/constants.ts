import { createTable } from "#src/services/shared/overlay/createTable";
import { bookmarksInApp } from "@esposter/db-schema";

// A bookmark row, held by its user and its path
export const bookmarkTable = createTable(bookmarksInApp);
