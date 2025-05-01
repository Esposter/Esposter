import type { PostWithRelations } from "#shared/db/schema/posts";
import type { CreateCommentInput } from "#shared/models/db/post/CreateCommentInput";
import type { DeleteCommentInput } from "#shared/models/db/post/DeleteCommentInput";
import type { UpdateCommentInput } from "#shared/models/db/post/UpdateCommentInput";

import { DerivedDatabaseEntityType } from "#shared/models/entity/DerivedDatabaseEntityType";
import { createOperationData } from "@/services/shared/createOperationData";
import { createCursorPaginationDataMap } from "@/services/shared/pagination/cursor/createCursorPaginationDataMap";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { uuidValidateV4 } from "@esposter/shared";

export const useCommentStore = defineStore("post/comment", () => {
  const { $trpc } = useNuxtApp();
  const router = useRouter();
  const currentPostId = computed(() => {
    const postId = router.currentRoute.value.params.id;
    return typeof postId === "string" && uuidValidateV4(postId) ? postId : undefined;
  });
  const currentPost = ref<PostWithRelations>();
  const { items, ...restData } = createCursorPaginationDataMap<PostWithRelations>(currentPostId);
  const {
    createComment: storeCreateComment,
    deleteComment: storeDeleteComment,
    updateComment: storeUpdateComment,
    ...restOperationData
  } = createOperationData(items, ["id"], DerivedDatabaseEntityType.Comment);

  const createComment = async (input: CreateCommentInput) => {
    if (!currentPost.value || EMPTY_TEXT_REGEX.test(input.description)) return;

    const newComment = await $trpc.post.createComment.mutate(input);
    if (!newComment) return;

    storeCreateComment(newComment);
    currentPost.value.noComments += 1;
  };
  const updateComment = async (input: UpdateCommentInput) => {
    const updatedComment = await $trpc.post.updateComment.mutate(input);
    if (!updatedComment) return;

    storeUpdateComment(updatedComment);
  };
  const deleteComment = async (input: DeleteCommentInput) => {
    if (!currentPost.value) return;

    const deletedComment = await $trpc.post.deleteComment.mutate(input);
    if (!deletedComment) return;

    storeDeleteComment({ id: deletedComment.id });
    currentPost.value.noComments -= 1;
  };

  return {
    createComment,
    deleteComment,
    updateComment,
    ...restOperationData,
    currentPost,
    ...restData,
  };
});
