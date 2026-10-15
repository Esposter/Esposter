import { usersInAuth } from "#src/schema/auth/usersInAuth";
import { usersToRoomsInMessage } from "#src/schema/message/usersToRoomsInMessage";
import { sql } from "drizzle-orm";

// An empty display name is "none" rather than null (see the nicknames doc), so nullif turns it into the account name.
// The client's getDisplayName applies the same fallback on the render path, and the two must agree
export const getDisplayNameExpression = () =>
  sql<string>`coalesce(nullif(${usersToRoomsInMessage.displayName}, ''), ${usersInAuth.name})`;
