import type { z } from "zod";

import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectUserStatusInMessageSchema } from "@esposter/db-schema";

export const upsertStatusInputSchema = refineAtLeastOne(
  selectUserStatusInMessageSchema.pick({ message: true, status: true }).partial(),
  ["message", "status"],
);
export type UpsertStatusInput = z.infer<typeof upsertStatusInputSchema>;
