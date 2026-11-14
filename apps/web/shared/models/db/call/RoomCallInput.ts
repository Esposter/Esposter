import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

// A room call and a thread call are the same call addressed by where it is, and the zero root id is the Room's own
export const roomCallInputSchema = z.object({ ...roomIdSchema.shape, threadRootId: z.int().nonnegative().default(0) });
export type RoomCallInput = z.infer<typeof roomCallInputSchema>;
