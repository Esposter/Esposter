import { selectRoomSchema, selectWebhookSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateWebhookInputSchema = z
  .object({
    ...selectWebhookSchema.pick({ id: true, isActive: true, name: true }).partial({ isActive: true, name: true }).shape,
    roomId: selectRoomSchema.shape.id,
  })
  .refine(({ isActive, name }) => isActive !== undefined || name !== undefined);
export type UpdateWebhookInput = z.infer<typeof updateWebhookInputSchema>;
