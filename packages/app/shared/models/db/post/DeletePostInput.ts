import { selectPostSchema } from "#shared/db/schema/posts";

export const deletePostInputSchema = selectPostSchema.get("id");
export type DeletePostInput = typeof deletePostInputSchema.infer;
