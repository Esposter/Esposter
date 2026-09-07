import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const onCreateMessageInputSchema = z.object({
  lastEventId: z.string().nullish(),
  ...roomIdSchema.shape,
});
export type OnCreateMessageInput = z.infer<typeof onCreateMessageInputSchema>;
