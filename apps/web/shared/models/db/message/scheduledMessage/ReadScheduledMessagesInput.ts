import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readScheduledMessagesInputSchema = z.object({ ...roomIdSchema.shape });
export type ReadScheduledMessagesInput = z.infer<typeof readScheduledMessagesInputSchema>;
