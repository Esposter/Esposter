import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const likesInPostRelation = defineRelationsPart(schema, (r) => ({
  likesInPost: {
    post: r.one.postsInPost({ from: r.likesInPost.postId, optional: false, to: r.postsInPost.id }),
    user: r.one.usersInAuth({ from: r.likesInPost.userId, optional: false, to: r.usersInAuth.id }),
  },
}));
