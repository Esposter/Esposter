import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectUserStatusInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

const upsertableStatusSchema = selectUserStatusInMessageSchema.pick({ message: true, status: true });

export const upsertStatusInputSchema = refineAtLeastOne(
  upsertableStatusSchema.partial(),
  upsertableStatusSchema.keyof().options,
);
export type UpsertStatusInput = z.infer<typeof upsertStatusInputSchema>;
