import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectUserSchema } from "@esposter/db-schema";
import { z } from "zod";

const updatableUserSchema = selectUserSchema.pick({ biography: true, image: true, name: true });

export const updateUserInputSchema = refineAtLeastOne(
  updatableUserSchema.partial(),
  updatableUserSchema.keyof().options,
);
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
