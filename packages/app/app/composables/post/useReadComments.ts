import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { useCommentStore } from "@/store/post/comment";

// One branch of the tree — the replies to `parentId`, paged on their own. Every node owns one of these, and the
// Route's post is the branch keyed by its own id, so the page and a reply ten levels down run the same read
export const useReadComments = (parentId: string) => {
  const { $trpc } = useNuxtApp();
  const commentStore = useCommentStore();
  const { getSliceOperationData } = commentStore;
  const { hasMore, isLoaded, items, readItems, readMoreItems } = getSliceOperationData(parentId);
  // The post page renders server-side, so the root branch's first page rides the payload into hydration
  const readComments = () =>
    readItems(() => $trpc.post.readPosts.query({ parentId }), { key: AsyncDataKey.ReadComments(parentId) });
  const readMoreComments = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.post.readPosts.query({ cursor, parentId }), onComplete);
  return { hasMore, isLoaded, items, readComments, readMoreComments };
};
