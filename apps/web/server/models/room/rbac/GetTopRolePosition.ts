import type { Context } from "@@/server/trpc/context";

export interface GetTopRolePosition {
  (db: Context["db"], userId: string, roomId: string): Promise<number>;
  (db: Context["db"], userId: string, roomIds: string[]): Promise<Map<string, number>>;
}
