import { type CreateLikeInput, type DeleteLikeInput, type UpdateLikeInput } from "@/server/trpc/routers/like";
import { usePostStore } from "@/store/post";
import { useCommentStore } from "@/store/post/comment";

export const useLikeStore = defineStore("post/like", () => {
  const { $client } = useNuxtApp();
  const { session } = useAuth();
  const postStore = usePostStore();
  const { postList } = storeToRefs(postStore);
  const commentStore = useCommentStore();
  const { currentPost, commentList } = storeToRefs(commentStore);

  const findPostOrComment = (id: string) => {
    // We kinda need to do this slightly annoying scan across all our tracked posts and comments
    // to consolidate the like store and prevent duplication of code whilst also keeping the separation
    // between posts and comments nice and simple
    const postOrCommentList = postList.value.concat(commentList.value);
    if (currentPost.value) postOrCommentList.push(currentPost.value);
    return postOrCommentList.find((c) => c.id === id);
  };

  const createLike = async (input: CreateLikeInput) => {
    const newLike = await $client.like.createLike.mutate(input);
    if (!newLike) return;

    const postOrComment = findPostOrComment(newLike.postId);
    if (!postOrComment) return;

    postOrComment.likes.push(newLike);
    postOrComment.noLikes += newLike.value;
  };
  const updateLike = async (input: UpdateLikeInput) => {
    const updatedLike = await $client.like.updateLike.mutate(input);
    if (!updatedLike) return;

    const postOrComment = findPostOrComment(updatedLike.postId);
    if (!postOrComment) return;

    const index = postOrComment.likes.findIndex(
      (l) => l.userId === updatedLike.userId && l.postId === updatedLike.postId,
    );
    if (index > -1) {
      postOrComment.likes[index] = { ...postOrComment.likes[index], ...updatedLike };
      postOrComment.noLikes += 2 * updatedLike.value;
    }
  };
  const deleteLike = async (postId: DeleteLikeInput) => {
    const userId = session.value?.user.id;
    if (!userId) return;

    await $client.like.deleteLike.mutate(postId);

    const postOrComment = findPostOrComment(postId);
    if (!postOrComment) return;

    const like = postOrComment.likes.find((l) => l.userId === userId && l.postId === postId);
    if (like) {
      postOrComment.likes = postOrComment.likes.filter((l) => !(l.userId === like.userId && l.postId === like.postId));
      postOrComment.noLikes -= like.value;
    }
  };

  return {
    createLike,
    updateLike,
    deleteLike,
  };
});
