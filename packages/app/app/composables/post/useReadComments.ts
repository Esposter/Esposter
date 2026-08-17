import { AsyncDataKey } from "@/services/shared/AsyncDataKey";
import { useCommentStore } from "@/store/post/comment";

export const useReadComments = (postId: string) => {
  const { $trpc } = useNuxtApp();
  const commentStore = useCommentStore();
  const { readItems, readMoreItems } = commentStore;
  // The post page renders server-side, so the first page of comments rides the payload into hydration
  const readComments = () =>
    readItems(() => $trpc.post.readPosts.query({ parentId: postId }), { key: AsyncDataKey.ReadComments(postId) });
  const readMoreComments = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.post.readPosts.query({ cursor, parentId: postId }), onComplete);
  return { readComments, readMoreComments };
};
