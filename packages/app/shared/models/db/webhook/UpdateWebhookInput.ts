import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { roomIdSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateWebhookInputSchema = refineAtLeastOne(
  z.object({
    ...roomIdSchema.shape,
    ...selectWebhookInMessageSchema
      .pick({ id: true, isActive: true, name: true })
      .partial({ isActive: true, name: true }).shape,
  }),
  ["isActive", "name"],
);
export type UpdateWebhookInput = z.infer<typeof updateWebhookInputSchema>;
