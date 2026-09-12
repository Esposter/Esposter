import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { Post, PostWithRelations, User } from "@esposter/db-schema";

import { getPostWithViewerLike } from "@@/server/services/post/getPostWithViewerLike";
import { getViewerPostRelations } from "@@/server/services/post/getViewerPostRelations";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { PostRelations } from "@esposter/db-schema";

// The row a card renders: the author beside it, and the viewer's own like when there is a viewer to have one.
// Signed out there is no like to look up, so the read drops the filtered relation rather than filtering on nobody
export const readPostWithRelations = async (
  db: Context["db"] | Transaction,
  id: Post["id"],
  entityType: string,
  userId?: User["id"],
): Promise<PostWithRelations> =>
  getPostWithViewerLike(
    await requireEntity(
      db.query.posts.findFirst({
        where: {
          id: {
            eq: id,
          },
        },
        with: userId ? getViewerPostRelations(userId) : PostRelations,
      }),
      entityType,
      id,
    ),
  );
