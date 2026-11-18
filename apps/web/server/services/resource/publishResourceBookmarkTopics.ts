import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { publishTopics } from "#server/services/realtime/publishTopics";
import { inJsonArray } from "@esposter/db";
import { bookmarksInApp, getTopic, TopicKind } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// A bookmark reads its resource only while the resource is live and published, so a write that deletes, restores,
// Publishes or unpublishes one changes what each of its bookmarkers' docks answers. Each bookmarker is told here, once
// The write has committed. Best-effort, as the topics a write publishes are: the write has landed, so a failed publish
// Costs a dock one refresh, never the write
export const publishResourceBookmarkTopics = async (
  db: Context["db"],
  resourceIds: ResourceInResource["id"][],
): Promise<void> => {
  await getResultAsync(async () => {
    const bookmarkers = await db
      .selectDistinct({ userId: bookmarksInApp.userId })
      .from(bookmarksInApp)
      .where(inJsonArray(bookmarksInApp.resourceId, resourceIds));
    await publishTopics(bookmarkers.map(({ userId }) => getTopic(TopicKind.Bookmark, userId)));
  }).match(noop, (error) => {
    console.error("Failed to publish the bookmarks of the changed resources:", error);
  });
};
