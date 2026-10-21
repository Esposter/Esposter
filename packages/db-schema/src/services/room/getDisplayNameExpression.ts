import type { SQLWrapper } from "drizzle-orm";

import { sql } from "drizzle-orm";

// An empty display name is "none" rather than null (see the nicknames doc), so nullif turns it into the account name.
// The client's getRoomMemberName falls back to the account name for a user with no row in the room, so the two agree
export const getDisplayNameExpression = (membership: { displayName: SQLWrapper }, user: { name: SQLWrapper }) =>
  sql<string>`coalesce(nullif(${membership.displayName}, ''), ${user.name})`;
