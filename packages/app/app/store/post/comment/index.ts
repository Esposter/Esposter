import type { CreateCommentInput } from "#shared/models/db/post/CreateCommentInput";
import type { DeleteCommentInput } from "#shared/models/db/post/DeleteCommentInput";
import type { UpdateCommentInput } from "#shared/models/db/post/UpdateCommentInput";
import type { PostWithRelations } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { createOperationData } from "@/services/shared/createOperationData";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { DerivedDatabaseEntityType } from "@esposter/db-schema";
import { noop, uuidValidateV4 } from "@esposter/shared";

export const useCommentStore = defineStore("post/comment", () => {
  const { $trpc } = useNuxtApp();
  const router = useRouter();
  const currentPostId = computed(() => {
    const postId = router.currentRoute.value.params.id;
    return typeof postId === "string" && uuidValidateV4(postId) ? postId : "";
  });
  const currentPost = ref<PostWithRelations>();
  const { items, ...restData } = useCursorPaginationDataMap<PostWithRelations>(currentPostId);
  const {
    createComment: storeCreateComment,
    deleteComment: storeDeleteComment,
    updateComment: storeUpdateComment,
    ...restOperationData
  } = createOperationData(items, ["id"], DerivedDatabaseEntityType.Comment);

  const { executeMutation: executeCreateCommentMutation } = useMutation();
  const { executeMutation: executeUpdateCommentMutation } = useMutation();
  const { executeMutation: executeDeleteCommentMutation } = useMutation();
  // Server-generated comment — non-optimistic, applied in onSuccess
  const createComment = async (input: CreateCommentInput) => {
    if (!currentPost.value || EMPTY_TEXT_REGEX.test(input.description)) return;

    await executeCreateCommentMutation(() => $trpc.post.createComment.mutate(input), {
      // Server-generated comment with no id yet, so each create gets a per-call symbol
      key: Symbol("createComment"),
      onSuccess: (newComment) => {
        if (!currentPost.value) return;
        storeCreateComment(newComment);
        currentPost.value.noComments += 1;
      },
    });
  };
  const updateComment = async (input: UpdateCommentInput) => {
    await executeUpdateCommentMutation(() => $trpc.post.updateComment.mutate(input), {
      // Read when the write is sent rather than when it was issued, and scoped to the one comment this write
      // Edits: a second edit of a comment queues behind the first, so its rollback has to restore what that one
      // Stored — and the same list is also appended to by the thread's own paging, which a whole-list restore
      // Would undo
      applyOptimistic: () => {
        const comment = items.value.find(({ id }) => id === input.id);
        const previousComment = comment ? { description: comment.description, id: comment.id } : undefined;
        storeUpdateComment(input);
        return () => {
          if (previousComment) storeUpdateComment(previousComment);
        };
      },
      key: input.id,
      onSuccess: (updatedComment) => {
        storeUpdateComment(updatedComment);
      },
    });
  };
  const deleteComment = async (input: DeleteCommentInput) => {
    if (!currentPost.value) return;

    await executeDeleteCommentMutation(() => $trpc.post.deleteComment.mutate(input), {
      applyOptimistic: () => {
        if (!currentPost.value) return noop;
        // The one row this write removes, read when the write is sent: deletes of different comments do not
        // Queue against each other, so restoring a copy of the list would resurrect one deleted beside this
        const deletedComment = items.value.find(({ id }) => id === input);
        storeDeleteComment({ id: input });
        currentPost.value.noComments -= 1;
        return () => {
          // The row comes back at the end rather than in its sorted place — cosmetic next to dropping rows the
          // Thread gained while the delete was in flight
          if (deletedComment) storeCreateComment(deletedComment);
          if (currentPost.value) currentPost.value.noComments += 1;
        };
      },
      key: input,
    });
  };

  return {
    createComment,
    deleteComment,
    items,
    updateComment,
    ...restOperationData,
    currentPost,
    ...restData,
  };
});
