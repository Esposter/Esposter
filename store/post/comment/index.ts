import type { PostWithRelations } from "@/db/schema/posts";
import { DerivedDatabaseEntityType } from "@/models/shared/entity/DerivedDatabaseEntityType";
import type { CreateCommentInput, DeleteCommentInput, UpdateCommentInput } from "@/server/trpc/routers/post";
import { createOperationData } from "@/services/shared/pagination/createOperationData";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { uuidValidateV4 } from "@/util/uuid/uuidValidateV4";

export const useCommentStore = defineStore("post/comment", () => {
  const { $client } = useNuxtApp();
  const router = useRouter();
  const currentPostId = computed(() => {
    const postId = router.currentRoute.value.params.id;
    return typeof postId === "string" && uuidValidateV4(postId) ? postId : null;
  });
  const currentPost = ref<PostWithRelations>();
  const { itemList, ...restData } = createCursorPaginationDataMap<PostWithRelations>(currentPostId);
  const {
    createComment: storeCreateComment,
    updateComment: storeUpdateComment,
    deleteComment: storeDeleteComment,
    ...restOperationData
  } = createOperationData(itemList, DerivedDatabaseEntityType.Comment);

  const createComment = async (input: CreateCommentInput) => {
    if (!currentPost.value || EMPTY_TEXT_REGEX.test(input.description)) return;

    const newComment = await $client.post.createComment.mutate(input);
    if (!newComment) return;

    storeCreateComment(newComment);
    currentPost.value.noComments += 1;
  };
  const updateComment = async (input: UpdateCommentInput) => {
    const updatedComment = await $client.post.updateComment.mutate(input);
    if (!updatedComment) return;

    storeUpdateComment(updatedComment);
  };
  const deleteComment = async (input: DeleteCommentInput) => {
    if (!currentPost.value) return;

    const deletedComment = await $client.post.deleteComment.mutate(input);
    if (!deletedComment) return;

    storeDeleteComment(deletedComment.id);
    currentPost.value.noComments -= 1;
  };

  return {
    currentPost,
    ...restOperationData,
    createComment,
    updateComment,
    deleteComment,
    ...restData,
  };
});
