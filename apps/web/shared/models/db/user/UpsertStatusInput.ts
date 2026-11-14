import type { z } from "zod";
import { refineAtLeastOne, selectUserStatusInMessageSchema } from "@esposter/db-schema";

const upsertableStatusSchema = selectUserStatusInMessageSchema.pick({ message: true, status: true });

export const upsertStatusInputSchema = refineAtLeastOne(
  upsertableStatusSchema.partial(),
  upsertableStatusSchema.keyof().options,
);
export type UpsertStatusInput = z.infer<typeof upsertStatusInputSchema>;
