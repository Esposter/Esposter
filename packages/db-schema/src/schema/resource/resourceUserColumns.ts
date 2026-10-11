import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { text, uuid } from "drizzle-orm/pg-core";

export const resourceUserColumns = {
  resourceId: uuid()
    .notNull()
    .references(() => resourcesInResource.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => usersInAuth.id, { onDelete: "cascade" }),
};
