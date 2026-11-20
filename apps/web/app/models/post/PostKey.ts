import type { PostInPost } from "@esposter/db-schema";

// A post a list holds by its id. The list's own page keeps the keys, and the rows are the overlay's
export type PostKey = Pick<PostInPost, "id">;
