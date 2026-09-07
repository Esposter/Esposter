import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectPostSchema } from "@esposter/db-schema";
import { z } from "zod";

const updatablePostSchema = selectPostSchema.pick({ description: true, title: true });

export const updatePostInputSchema = refineAtLeastOne(
  z.object({
    ...selectPostSchema.pick({ id: true }).shape,
    ...updatablePostSchema.partial().shape,
  }),
  updatablePostSchema.keyof().options,
);
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;
