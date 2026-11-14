import { z } from "zod";

// What a room's object holds: every message row it has, and the number of the newest. The cutover reads it back after an
// Import, so verify can compare each room with what Azure gave it. A room with no messages has no newest, so the field is
// Absent rather than null
export const roomSummarySchema = z.object({
  messageCount: z.int().nonnegative(),
  newestId: z.int().positive().optional(),
});
export type RoomSummary = z.infer<typeof roomSummarySchema>;
