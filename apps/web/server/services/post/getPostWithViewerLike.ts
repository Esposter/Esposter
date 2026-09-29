import type { LikeInPost, PostInPost, PostInPostWithRelations, PublicUser } from "@esposter/db-schema";

export const getPostWithViewerLike = ({
  likes,
  ...post
}: PostInPost & { likes?: LikeInPost[]; user: PublicUser }): PostInPostWithRelations => ({
  ...post,
  viewerLike: likes?.at(0),
});
