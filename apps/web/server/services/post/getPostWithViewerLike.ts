import type { LikeInPost, PostInPost, PostInPostWithRelations, PublicUser } from "@esposter/db-schema";

export const getPostWithViewerLike = ({
  likesInPost,
  ...post
}: PostInPost & { likesInPost?: LikeInPost[]; user: PublicUser }): PostInPostWithRelations => ({
  ...post,
  viewerLike: likesInPost?.at(0),
});
