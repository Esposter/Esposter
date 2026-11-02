import { MAX_POST_COUNTS_PER_READ } from "#shared/models/db/post/ReadPostCountsInput";
import { postCountHooks } from "@/services/post/postCountHooks";
import { createBatchedRefresh } from "@/services/shared/createBatchedRefresh";
import { chunk, settleAll } from "@esposter/shared";

// The one owner of the counts the server keeps on posts. A write that changes one asks this store to read them back.
// The read is applied to every copy the client holds, through the hooks each copy's store registered
export const usePostCountStore = defineStore("post/count", () => {
  const { $trpc } = useNuxtApp();
  const refreshPostCounts = createBatchedRefresh(async (postIds: string[]) => {
    // The read caps its list, so a larger set is read a chunk at a time: one at a time, since chunks issued together
    // Would join one batch and one request again
    const postCounts = await settleAll(
      chunk(postIds, MAX_POST_COUNTS_PER_READ).map(
        (postIdsChunk) => () => $trpc.post.readPostCounts.query(postIdsChunk),
      ),
      1,
    );
    for (const applyPostCounts of postCountHooks.hooks) applyPostCounts(postCounts.flat());
  });
  return { refreshPostCounts };
});
