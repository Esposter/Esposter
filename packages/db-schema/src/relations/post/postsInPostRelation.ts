import type { PublicUser } from "#src/models/user/PublicUser";
import type { LikeInPost } from "#src/schema/post/likesInPost";
import type { PostInPost } from "#src/schema/post/postsInPost";

import { schema } from "#src/generated/schema";
import { PublicUserColumns } from "#src/services/user/PublicUserColumns";
import { defineRelationsPart } from "drizzle-orm";

export const postsInPostRelation = defineRelationsPart(schema, (r) => ({
  postsInPost: {
    likes: r.many.likesInPost({ from: r.postsInPost.id, to: r.likesInPost.postId }),
    user: r.one.usersInAuth({ from: r.postsInPost.userId, optional: false, to: r.usersInAuth.id }),
    usersViaLikes: r.many.usersInAuth({
      alias: "posts_id_users_id_via_likes",
      from: r.postsInPost.id.through(r.likesInPost.postId),
      to: r.usersInAuth.id.through(r.likesInPost.userId),
    }),
    usersViaPosts: r.many.usersInAuth({
      alias: "posts_id_users_id_via_posts",
      from: r.postsInPost.id.through(r.postsInPost.parentId),
      to: r.usersInAuth.id.through(r.postsInPost.userId),
    }),
  },
}));

export const PostInPostRelations = { user: { columns: PublicUserColumns } } as const;
// The likes relation is only a server-side fetch strategy filtered to the viewer's row,
// So every procedure returns at most one like — the viewer's — instead of all of them
export type PostInPostWithRelations = PostInPost & { user: PublicUser; viewerLike?: LikeInPost };
