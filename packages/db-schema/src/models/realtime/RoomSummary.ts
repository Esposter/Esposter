import { z } from "zod";

// What a room's object holds: every message row it has, and the number of the newest. The cutover reads it back after an
// import, so verify can compare each room with what Azure gave it
export const roomSummarySchema = z.object({
  messageCount: z.number().int().nonnegative(),
  newestId: z.number().int().positive().nullable(),
});
export type RoomSummary = z.infer<typeof roomSummarySchema>;
