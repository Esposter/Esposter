import { createTable } from "#src/services/shared/overlay/createTable";
import { usersInAuth } from "@esposter/db-schema";

// The user rows held on the overlay. The owner's row is the one the storage meter shows, and a content save moves its total
export const userTable = createTable(usersInAuth);
