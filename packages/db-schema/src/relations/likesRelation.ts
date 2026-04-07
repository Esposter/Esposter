import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const likesRelation = defineRelationsPart(schema, (r) => ({
  likes: {
    post: r.one.posts({
      from: r.likes.postId,
      optional: false,
      to: r.posts.id,
    }),
    user: r.one.users({
      from: r.likes.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));
