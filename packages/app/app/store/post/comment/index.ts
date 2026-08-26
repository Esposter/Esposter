import type { CreateCommentInput } from "#shared/models/db/post/CreateCommentInput";
import type { DeleteCommentInput } from "#shared/models/db/post/DeleteCommentInput";
import type { UpdateCommentInput } from "#shared/models/db/post/UpdateCommentInput";
import type { PostWithRelations } from "@esposter/db-schema";

import { useMutation } from "@/composables/shared/useMutation";
import { createOperationData } from "@/services/shared/createOperationData";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { DerivedDatabaseEntityType } from "@esposter/db-schema";

export const useCommentStore = defineStore("post/comment", () => {
  const { $trpc } = useNuxtApp();
  const currentPost = ref<PostWithRelations>();
  // Keyed by the post whose replies the partition holds, and read against a named key rather than a current one:
  // Every node in the tree pages independently, so no partition is ever the current one. The route's own post is
  // Simply the branch whose key is its id — one code path for the page and for every reply beneath it
  const { getDataRef, getIsLoadedRef, getSlice, keys } = useCursorPaginationDataMap<PostWithRelations>("");
  const getPostOperationData = (parentId: string) =>
    createOperationData(getSlice(parentId).items, ["id"], DerivedDatabaseEntityType.Comment);
  // Every comment on screen, across every open branch — a row the tree is holding ten levels down is in none of
  // The lists above it, and both a counter and a vote have to reach it wherever it sits
  const allComments = computed(() => {
    const comments = currentPost.value ? [currentPost.value] : [];
    for (const key of keys.value) comments.push(...getSlice(key).items.value);
    return comments;
  });
  // The posts the server says it counted against, applied in one pass over the rows on screen. The chain itself
  // Is never walked here: the write already established it, and rediscovering it client-side would mean scanning
  // The loaded branches once per level to learn what the response already carries
  const updateCommentCounts = (ancestorIds: string[], delta: number) => {
    const ancestorIdSet = new Set(ancestorIds);
    for (const comment of allComments.value) if (ancestorIdSet.has(comment.id)) comment.noComments += delta;
  };
  // Every loaded reply beneath a comment, which is what the delete cascade removes from under it. A store that
  // Dropped the one row would leave its descendants rendering under a parent that no longer exists.
  // Only branches that exist are descended into: asking for one that does not creates it, so a walk over the
  // Rows themselves would leave an empty partition behind for every reply it passed
  const removeBranch = (parentId: string) => {
    const branchKeys = new Set(keys.value);
    const removeLoadedBranch = (key: string) => {
      if (!branchKeys.has(key)) return;

      const { items: branchItems } = getSlice(key);
      for (const { id } of branchItems.value) removeLoadedBranch(id);
      branchItems.value = [];
    };
    removeLoadedBranch(parentId);
  };

  const { executeMutation: executeCreateCommentMutation } = useMutation();
  const { executeMutation: executeUpdateCommentMutation } = useMutation();
  const { executeMutation: executeDeleteCommentMutation } = useMutation();
  // Server-generated comment — non-optimistic, applied in onSuccess
  const createComment = async (input: CreateCommentInput) => {
    if (EMPTY_TEXT_REGEX.test(input.description)) return;

    // The branch is named when the write is issued, so a reply landing after the reader opened another thread is
    // Filed under the comment it was written against rather than under whatever is on screen
    const { createComment: storeCreateComment } = getPostOperationData(input.parentId);
    await executeCreateCommentMutation(() => $trpc.post.createComment.mutate(input), {
      // Server-generated comment with no id yet, so each create gets a per-call symbol
      key: Symbol("createComment"),
      onSuccess: ({ ancestorIds, comment }) => {
        storeCreateComment(comment);
        updateCommentCounts(ancestorIds, 1);
      },
    });
  };
  const updateComment = async (input: UpdateCommentInput, parentId: string) => {
    const { items: branchItems } = getSlice(parentId);
    const { updateComment: storeUpdateComment } = getPostOperationData(parentId);
    await executeUpdateCommentMutation(() => $trpc.post.updateComment.mutate(input), {
      // Read when the write is sent rather than when it was issued, and scoped to the one comment this write
      // Edits: a second edit of a comment queues behind the first, so its rollback has to restore what that one
      // Stored — and the same list is also appended to by the branch's own paging, which a whole-list restore
      // Would undo
      applyOptimistic: () => {
        const comment = branchItems.value.find(({ id }) => id === input.id);
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
  const deleteComment = async (input: DeleteCommentInput, parentId: string) => {
    const { items: branchItems } = getSlice(parentId);
    const { createComment: storeCreateComment, deleteComment: storeDeleteComment } = getPostOperationData(parentId);
    await executeDeleteCommentMutation(() => $trpc.post.deleteComment.mutate(input), {
      // The rows go at once and the counters when the server answers. A delete cascades, so how many rows it
      // Takes is only knowable there — a client guess drawn from whatever happens to be expanded is short by
      // Every reply nobody opened, and that guess would be the number on screen rather than one briefly behind
      applyOptimistic: () => {
        // The one row this write removes, read when the write is sent: deletes of different comments do not
        // Queue against each other, so restoring a copy of the list would resurrect one deleted beside this
        const deletedComment = branchItems.value.find(({ id }) => id === input);
        removeBranch(input);
        storeDeleteComment({ id: input });
        return () => {
          // The row comes back at the end rather than in its sorted place — cosmetic next to dropping rows the
          // Branch gained while the delete was in flight. Its own replies stay gone: they were never this
          // Write to restore, and re-opening the branch reads them again
          if (deletedComment) storeCreateComment(deletedComment);
        };
      },
      key: input,
      onSuccess: ({ ancestorIds, noRemovedComments }) => {
        updateCommentCounts(ancestorIds, -noRemovedComments);
      },
    });
  };

  return {
    allComments,
    createComment,
    currentPost,
    deleteComment,
    getDataRef,
    getIsLoadedRef,
    getSlice,
    updateComment,
  };
});
