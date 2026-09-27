import type { Like, Post, PostWithRelations, PublicUser } from "@esposter/db-schema";

export const getPostWithViewerLike = ({
  likes,
  ...post
}: Post & { likes?: Like[]; user: PublicUser }): PostWithRelations => ({ ...post, viewerLike: likes?.at(0) });
