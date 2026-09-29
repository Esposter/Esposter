import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectPostInPostSchema } from "@esposter/db-schema";
import { z } from "zod";

const updatablePostSchema = selectPostInPostSchema.pick({ description: true, title: true });

export const updatePostInputSchema = refineAtLeastOne(
  z.object({ ...selectPostInPostSchema.pick({ id: true }).shape, ...updatablePostSchema.partial().shape }),
  updatablePostSchema.keyof().options,
);
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
