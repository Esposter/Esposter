import { roomIdSchema, roomMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

// A thread is named by its room and the integer id of its root message
export const readThreadInputSchema = z.object({ ...roomIdSchema.shape, threadRootId: roomMessageSchema.shape.id });
export type ReadThreadInput = z.infer<typeof readThreadInputSchema>;
