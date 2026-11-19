import type { PostCountFields, PostCounts } from "#src/services/post/applyPostCounts";

import { MAX_POST_COUNTS_PER_READ } from "#shared/models/db/post/ReadPostCountsInput";
import { applyPostCounts } from "#src/services/post/applyPostCounts";
import { createBatchedRefresh } from "#src/services/shared/createBatchedRefresh";
import { createHookRegistry } from "#src/services/shared/createHookRegistry";
import { chunk, settleAll } from "@esposter/shared";

// The one owner of the counts the server keeps on posts. A write that changes one asks this store to read them back.
// The read is applied to every copy the client holds: each store names its copies where it is constructed, and the
// Naming ends with that store's scope
export const usePostCountStore = defineStore("post/count", () => {
  const { $trpc } = useNuxtApp();
  const copyAppliers = createHookRegistry<(postCounts: PostCounts) => void>();
  const registerPostCopies = (getCopies: () => PostCountFields[]) => {
    onScopeDispose(
      copyAppliers.register((postCounts) => {
        applyPostCounts(getCopies(), postCounts);
      }),
    );
  };
  const refreshPostCounts = createBatchedRefresh(async (postIds: string[]) => {
    // The read caps its list, so a larger set is read a chunk at a time: one at a time, since chunks issued together
    // Would join one batch and one request again
    const postCounts = await settleAll(
      chunk(postIds, MAX_POST_COUNTS_PER_READ).map(
        (postIdsChunk) => () => $trpc.post.readPostCounts.query(postIdsChunk),
      ),
      1,
    );
    for (const applyCounts of copyAppliers.hooks) applyCounts(postCounts.flat());
  });
  return { refreshPostCounts, registerPostCopies };
});
