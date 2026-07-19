import type { CreateCommentInput } from "#shared/models/db/post/CreateCommentInput";
import type { DeleteCommentInput } from "#shared/models/db/post/DeleteCommentInput";
import type { UpdateCommentInput } from "#shared/models/db/post/UpdateCommentInput";
import type { PostWithRelations } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { createOperationData } from "@/services/shared/createOperationData";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { DerivedDatabaseEntityType } from "@esposter/db-schema";
import { uuidValidateV4 } from "@esposter/shared";

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
      onSuccess: (newComment) => {
        if (!currentPost.value) return;
        storeCreateComment(newComment);
        currentPost.value.noComments += 1;
      },
    });
  };
  const updateComment = async (input: UpdateCommentInput) => {
    const snapshot = items.value.map((comment) => ({ ...comment }));
    await executeUpdateCommentMutation(() => $trpc.post.updateComment.mutate(input), {
      applyOptimistic: () => {
        storeUpdateComment(input);
        return () => {
          items.value = snapshot;
        };
      },
      onSuccess: (updatedComment) => {
        storeUpdateComment(updatedComment);
      },
    });
  };
  const deleteComment = async (input: DeleteCommentInput) => {
    if (!currentPost.value) return;

    const snapshot = [...items.value];
    await executeDeleteCommentMutation(() => $trpc.post.deleteComment.mutate(input), {
      applyOptimistic: () => {
        if (!currentPost.value) return () => undefined;
        storeDeleteComment({ id: input });
        currentPost.value.noComments -= 1;
        return () => {
          items.value = snapshot;
          if (currentPost.value) currentPost.value.noComments += 1;
        };
      },
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
