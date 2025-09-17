import { useCommentStore } from "@/store/post/comment";

export const useReadComments = (postId: string) => {
  const { $trpc } = useNuxtApp();
  const commentStore = useCommentStore();
  const { readItems, readMoreItems } = commentStore;
  const readComments = () => readItems(() => $trpc.post.readPosts.useQuery({ parentId: postId }));
  const readMoreComments = () => readMoreItems((cursor) => $trpc.post.readPosts.query({ cursor, parentId: postId }));
  return { readComments, readMoreComments };
};
