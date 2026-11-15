import { useCommentStore } from "#src/store/post/comment/index";
import { usePostStore } from "#src/store/post/index";

// The one write path for a vote, over every list a post can be on screen in: the feed and a post page's thread, whose
// Root is its own read of a post the feed may also hold
export const useLikeStore = defineStore("post/like", () => {
  const postStore = usePostStore();
  const commentStore = useCommentStore();
  return useLikeOperations(() => [...postStore.items, ...commentStore.allComments]);
});
