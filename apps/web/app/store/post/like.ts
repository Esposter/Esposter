import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";

import { useSessionUserId } from "#src/composables/auth/useSessionUserId";
import { likeTable } from "#src/services/post/overlay/constants";
import { getLikePatchEntry } from "#src/services/post/overlay/getLikePatchEntry";
import { getSetLikeEntry } from "#src/services/post/overlay/getSetLikeEntry";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { usePostCountStore } from "#src/store/post/count";
import { NO_ROW_VERSION } from "@esposter/db-schema";

// The one write path for a vote, over every copy of its post on screen: the feed, a thread and the post page read the
// Vote from the overlay, so a vote is drawn once and reaches each of them. A vote's count is the server's, and it is read
// Back once the vote is kept
export const useLikeStore = defineStore("post/like", () => {
  const { $trpc } = useNuxtApp();
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { writeOptimistic } = overlayStore;
  const postCountStore = usePostCountStore();
  const { refreshPostCountsInBackground } = postCountStore;
  // A vote's row is drawn at once, with no version until the server names one. A second vote on one post is queued
  // Behind the first, since both write the one row, so a rapid second click cannot send a second create
  const createLike = (input: CreateLikeInput) => {
    const now = new Date();
    writeOptimistic(
      async () => {
        const like = await $trpc.like.createLike.mutate(input);
        refreshPostCountsInBackground([input.postId]);
        return createRowResponse(likeTable, like);
      },
      {
        entry: getSetLikeEntry({
          createdAt: now,
          deletedAt: null,
          postId: input.postId,
          updatedAt: now,
          userId: userId.value,
          value: input.value,
          version: NO_ROW_VERSION,
        }),
        onError: createErrorAlert,
      },
    );
  };
  const updateLike = (input: UpdateLikeInput) => {
    writeOptimistic(
      async () => {
        const like = await $trpc.like.updateLike.mutate(input);
        refreshPostCountsInBackground([input.postId]);
        return createRowResponse(likeTable, like);
      },
      { entry: getLikePatchEntry(userId.value, input.postId, { value: input.value }), onError: createErrorAlert },
    );
  };
  // A removed vote is the tombstone the server answers, which the overlay keeps at its version
  const deleteLike = (postId: DeleteLikeInput) => {
    writeOptimistic(
      async () => {
        const removedLike = await $trpc.like.deleteLike.mutate(postId);
        refreshPostCountsInBackground([postId]);
        return createRowResponse(likeTable, removedLike);
      },
      { entry: getLikePatchEntry(userId.value, postId, { deletedAt: new Date() }), onError: createErrorAlert },
    );
  };

  return { createLike, deleteLike, updateLike };
});
