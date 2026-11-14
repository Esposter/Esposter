import { roomIdSchema, roomMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

// A thread is named by its room and the integer id of its root message
export const unfollowThreadInputSchema = z.object({ ...roomIdSchema.shape, threadRootId: roomMessageSchema.shape.id });
export type UnfollowThreadInput = z.infer<typeof unfollowThreadInputSchema>;
