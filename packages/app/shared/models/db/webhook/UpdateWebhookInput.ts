import { selectRoomSchema, selectWebhookSchema } from "@esposter/db-schema";
import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { z } from "zod";

export const updateWebhookInputSchema = refineAtLeastOne(
  z.object({
    ...selectWebhookSchema.pick({ id: true, isActive: true, name: true }).partial({ isActive: true, name: true }).shape,
    roomId: selectRoomSchema.shape.id,
  }),
  ["isActive", "name"],
);
export type UpdateWebhookInput = z.infer<typeof updateWebhookInputSchema>;
