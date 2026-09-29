import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { PostInPost, PostInPostWithRelations, UserInAuth } from "@esposter/db-schema";

import { getPostWithViewerLike } from "@@/server/services/post/getPostWithViewerLike";
import { getViewerPostRelations } from "@@/server/services/post/getViewerPostRelations";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { PostInPostRelations } from "@esposter/db-schema";

// The row a card renders: the author beside it, and the viewer's own like when there is a viewer to have one.
// Signed out there is no like to look up, so the read drops the filtered relation rather than filtering on nobody
export const readPostWithRelations = async (
  db: Context["db"] | Transaction,
  id: PostInPost["id"],
  entityType: string,
  userId?: UserInAuth["id"],
): Promise<PostInPostWithRelations> =>
  getPostWithViewerLike(
    await requireEntity(
      db.query.postsInPost.findFirst({
        where: { id: { eq: id } },
        with: userId ? getViewerPostRelations(userId) : PostInPostRelations,
      }),
      entityType,
      id,
    ),
  );
