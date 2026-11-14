import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

// A scheduled message is named by its room and its id, which its room's object keys it by
export const scheduledMessageIdentityInputSchema = z.object({ ...roomIdSchema.shape, id: z.uuidv7() });
export type ScheduledMessageIdentityInput = z.infer<typeof scheduledMessageIdentityInputSchema>;
