import type { PostCountFields } from "#src/models/post/PostCountFields";

import { MAX_POST_COUNTS_PER_READ } from "#shared/models/db/post/ReadPostCountsInput";
import { createBatchedRefresh } from "#src/services/shared/createBatchedRefresh";
import { chunk, settleAll } from "@esposter/shared";

// The one owner of the counts the server keeps on posts, by post id. A count has no row of its own, so it is not on the
// overlay: each count is held at the version of its post's row, and a count takes the place of an older one only, so a
// read that lands late cannot put back a count a newer write has already moved
export const usePostCountStore = defineStore("post/count", () => {
  const { $trpc } = useNuxtApp();
  const postCounts = ref(new Map<string, Omit<PostCountFields, "id">>());
  const setPostCounts = (counts: PostCountFields[]) => {
    for (const { commentCount, id, likeCount, version } of counts) {
      const heldCount = postCounts.value.get(id);
      if (!heldCount || heldCount.version <= version) postCounts.value.set(id, { commentCount, likeCount, version });
    }
  };
  const refreshPostCounts = createBatchedRefresh(async (postIds: string[]) => {
    // The read caps its list, so a larger set is read a chunk at a time: one at a time, since chunks issued together
    // Would join one batch and one request again
    const postCountReads = await settleAll(
      chunk(postIds, MAX_POST_COUNTS_PER_READ).map(
        (postIdsChunk) => () => $trpc.post.readPostCounts.query(postIdsChunk),
      ),
      1,
    );
    setPostCounts(postCountReads.flat());
  });
  return { postCounts, refreshPostCounts, setPostCounts };
});
