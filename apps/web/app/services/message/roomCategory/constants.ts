import { createTable } from "#src/services/shared/overlay/createTable";
import { roomCategoriesInMessage } from "@esposter/db-schema";

// The room categories the overlay holds, one slot. A category's id is its whole key
export const roomCategoryTable = createTable(roomCategoriesInMessage);
