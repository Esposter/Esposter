import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const likesRelation = defineRelationsPart(schema, (r) => ({
  likes: {
    post: r.one.posts({
      from: r.likes.postId,
      to: r.posts.id,
    }),
    user: r.one.users({
      from: r.likes.userId,
      to: r.users.id,
    }),
  },
}));
