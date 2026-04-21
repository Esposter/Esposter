import type { z } from "zod";

import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectUserSchema } from "@esposter/db-schema";

export const updateUserInputSchema = refineAtLeastOne(
  selectUserSchema.pick({ biography: true, image: true, name: true }).partial(),
  ["biography", "image", "name"],
);
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
