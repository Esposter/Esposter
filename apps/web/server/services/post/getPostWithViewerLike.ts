import type { LikeInPost, PostInPost, PostInPostWithRelations, PublicUser } from "@esposter/db-schema";

export const getPostWithViewerLike = ({
  likesInPost,
  ...post
}: { likesInPost?: LikeInPost[]; user: PublicUser } & PostInPost): PostInPostWithRelations => ({
  ...post,
  viewerLike: likesInPost?.at(0),
});
