import type { Like, Post, PostWithRelations, User } from "@esposter/db-schema";

export const getPostWithViewerLike = ({
  likes,
  ...post
}: Post & { likes?: Like[]; user: User }): PostWithRelations => ({ ...post, viewerLike: likes?.at(0) });
