import type { Database } from "@esposter/db-schema";

export interface GetPermissions {
  (db: Database, userId: string, roomId: string): Promise<bigint>;
  (db: Database, userId: string, roomIds: string[]): Promise<Map<string, bigint>>;
}
