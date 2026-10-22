import { postCountHooks } from "@/services/post/postCountHooks";
import { createBatchedRefresh } from "@/services/shared/createBatchedRefresh";

// The one owner of the counts the server keeps on posts. A write that changes one asks this store to read them back,
// The read lands on every copy the client holds, through the hooks each copy's store registered
export const usePostCountStore = defineStore("post/count", () => {
  const { $trpc } = useNuxtApp();
  const refreshPostCounts = createBatchedRefresh(async (postIds: string[]) => {
    const postCounts = await $trpc.post.readPostCounts.query(postIds);
    for (const applyPostCounts of postCountHooks.hooks) applyPostCounts(postCounts);
  });
  return { refreshPostCounts };
});
