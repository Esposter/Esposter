import type { PublicUser } from "#src/models/user/PublicUser";
import type { AnyColumn } from "drizzle-orm";

// The same columns for a SQL-style select, over the users table or an alias of it
export const getPublicUserColumns = <TTable extends Record<keyof PublicUser, AnyColumn>>(
  table: TTable,
): Pick<TTable, keyof PublicUser> => ({
  biography: table.biography,
  createdAt: table.createdAt,
  deletedAt: table.deletedAt,
  id: table.id,
  image: table.image,
  name: table.name,
  updatedAt: table.updatedAt,
});
