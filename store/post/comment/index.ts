import { type PostWithRelations } from "@/db/schema/posts";
import { type CreateCommentInput, type DeleteCommentInput, type UpdateCommentInput } from "@/server/trpc/routers/post";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/createCursorPaginationDataMap";
import { uuidValidateV4 } from "@/util/uuid";

export const useCommentStore = defineStore("post/comment", () => {
  const { $client } = useNuxtApp();
  const router = useRouter();
  const currentPostId = computed(() => {
    const postId = router.currentRoute.value.params.id;
    return typeof postId === "string" && uuidValidateV4(postId) ? postId : null;
  });
  const currentPost = ref<PostWithRelations | null>();
  const {
    itemList: commentList,
    pushItemList: pushCommentList,
    ...rest
  } = createCursorPaginationDataMap<PostWithRelations>(currentPostId);

  const createComment = async (input: CreateCommentInput) => {
    if (!currentPost.value) return;

    const newComment = await $client.post.createComment.mutate(input);
    if (!newComment) return;

    commentList.value.push(newComment);
    currentPost.value.noComments += 1;
  };
  const updateComment = async (input: UpdateCommentInput) => {
    const updatedComment = await $client.post.updateComment.mutate(input);
    if (!updatedComment) return;

    const index = commentList.value.findIndex((r) => r.id === updatedComment.id);
    if (index > -1) commentList.value[index] = { ...commentList.value[index], ...updatedComment };
  };
  const deleteComment = async (commentId: DeleteCommentInput) => {
    if (!currentPost.value) return;

    const deletedComment = await $client.post.deleteComment.mutate(commentId);
    if (!deletedComment) return;

    commentList.value = commentList.value.filter((r) => r.id !== deletedComment.id);
    currentPost.value.noComments -= 1;
  };

  return {
    currentPost,
    commentList,
    pushCommentList,
    ...rest,
    createComment,
    updateComment,
    deleteComment,
  };
});
