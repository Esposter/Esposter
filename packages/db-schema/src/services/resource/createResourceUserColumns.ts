import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { resourcesInResource } from "#src/schema/resource/resourcesInResource";
import { text } from "drizzle-orm/sqlite-core";

export const createResourceUserColumns = () => ({
  resourceId: text()
    .notNull()
    .references(() => resourcesInResource.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => usersInAuth.id, { onDelete: "cascade" }),
});
