import type { Like } from "@/schema/likes";
import type { Post } from "@/schema/posts";
import type { User } from "@/schema/users";

import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const postsRelation = defineRelationsPart(schema, (r) => ({
  posts: {
    likes: r.many.likes({
      from: r.posts.id,
      to: r.likes.postId,
    }),
    user: r.one.users({
      from: r.posts.userId,
      optional: false,
      to: r.users.id,
    }),
    usersViaLikes: r.many.users({
      alias: "posts_id_users_id_via_likes",
      from: r.posts.id.through(r.likes.postId),
      to: r.users.id.through(r.likes.userId),
    }),
    usersViaPosts: r.many.users({
      alias: "posts_id_users_id_via_posts",
      from: r.posts.id.through(r.posts.parentId),
      to: r.users.id.through(r.posts.userId),
    }),
  },
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const PostRelations = {
  likes: true,
  user: true,
} as const;
export type PostWithRelations = Post & { likes: Like[]; user: User };
