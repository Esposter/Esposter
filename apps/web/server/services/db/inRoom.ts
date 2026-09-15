import type { AnyColumn } from "drizzle-orm";

import { and, eq } from "drizzle-orm";

export const inRoom = (table: { id: AnyColumn; roomId: AnyColumn }, id: string, roomId: string) =>
  and(eq(table.id, id), eq(table.roomId, roomId));
