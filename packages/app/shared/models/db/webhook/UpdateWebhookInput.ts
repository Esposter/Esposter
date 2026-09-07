import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { roomIdSchema, selectWebhookInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

const updatableWebhookSchema = selectWebhookInMessageSchema.pick({ isActive: true, name: true });

export const updateWebhookInputSchema = refineAtLeastOne(
  z.object({
    ...roomIdSchema.shape,
    ...selectWebhookInMessageSchema.pick({ id: true }).shape,
    ...updatableWebhookSchema.partial().shape,
  }),
  updatableWebhookSchema.keyof().options,
);
export type UpdateWebhookInput = z.infer<typeof updateWebhookInputSchema>;
