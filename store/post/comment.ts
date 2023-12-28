import { type PostWithRelations } from "@/db/schema/posts";
import { type CreateCommentInput, type DeletePostInput, type UpdateCommentInput } from "@/server/trpc/routers/post";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/createCursorPaginationDataMap";
import { uuidValidateV4 } from "@/util/uuid";

export const useCommentStore = defineStore("comment/comment", () => {
  const { $client } = useNuxtApp();
  const router = useRouter();
  const currentPostId = computed(() => {
    const routeParamsId = router.currentRoute.value.params.id;
    return typeof routeParamsId === "string" && uuidValidateV4(routeParamsId) ? routeParamsId : null;
  });
  const {
    itemList: commentList,
    pushItemList: pushCommentList,
    ...rest
  } = createCursorPaginationDataMap<PostWithRelations>(currentPostId);

  const createComment = async (input: CreateCommentInput) => {
    const newComment = await $client.post.createComment.mutate(input);
    if (newComment) commentList.value.push(newComment);
  };
  const updateComment = async (input: UpdateCommentInput) => {
    const updatedComment = await $client.post.updateComment.mutate(input);
    if (updatedComment) {
      const index = commentList.value.findIndex((r) => r.id === updatedComment.id);
      if (index > -1) commentList.value[index] = { ...commentList.value[index], ...updatedComment };
    }
  };
  const deleteComment = async (id: DeletePostInput) => {
    // Remember that posts and comments are the same in terms of data
    await $client.post.deletePost.mutate(id);
    commentList.value = commentList.value.filter((r) => r.id !== id);
  };

  return {
    commentList,
    pushCommentList,
    ...rest,
    createComment,
    updateComment,
    deleteComment,
  };
});
