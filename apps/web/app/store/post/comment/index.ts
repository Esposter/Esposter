import type { CreateCommentInput } from "#shared/models/db/post/CreateCommentInput";
import type { DeleteCommentInput } from "#shared/models/db/post/DeleteCommentInput";
import type { UpdateCommentInput } from "#shared/models/db/post/UpdateCommentInput";
import type { PostWithRelations } from "@esposter/db-schema";

import { createOperationData } from "@/services/shared/createOperationData";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { DerivedDatabaseEntityType } from "@esposter/db-schema";

export const useCommentStore = defineStore("post/comment", () => {
  const { $trpc } = useNuxtApp();
  const currentPost = ref<PostWithRelations>();
  // Keyed by the post whose replies the partition holds, the route's own post included
  const { getSlice, getSliceOperationData, keys } = useCursorPaginationDataMap<PostWithRelations>();
  const getCommentOperationData = (parentId: string) =>
    createOperationData(getSlice(parentId).items, ["id"], DerivedDatabaseEntityType.Comment);
  const allComments = computed(() => {
    const comments = currentPost.value ? [currentPost.value] : [];
    for (const key of keys.value) comments.push(...getSlice(key).items.value);
    return comments;
  });
  const updateCommentCounts = (ancestorIds: string[], delta: number) => {
    const ancestorIdSet = new Set(ancestorIds);
    for (const comment of allComments.value) if (ancestorIdSet.has(comment.id)) comment.commentCount += delta;
  };
  // Only branches that already exist are descended into: asking the map for one that does not creates it, so a
  // Walk over the rows themselves would leave an empty partition behind for every reply it passed
  const deleteBranch = (parentId: string) => {
    const branchKeys = new Set(keys.value);
    const deleteLoadedBranch = (key: string) => {
      if (!branchKeys.has(key)) return;

      const { isLoaded, items: branchItems } = getSlice(key);
      for (const { id } of branchItems.value) deleteLoadedBranch(id);
      branchItems.value = [];
      // Emptied rather than answered: a branch that keeps saying it is loaded is one a re-expansion will not read
      // Again, so a delete the server rejects would leave the replies underneath it invisible until a reload
      isLoaded.value = false;
    };
    deleteLoadedBranch(parentId);
  };

  const { executeMutation: executeCreateCommentMutation } = useMutation();
  const { executeMutation: executeUpdateCommentMutation } = useMutation();
  const { executeMutation: executeDeleteCommentMutation } = useMutation();
  const createComment = async (input: CreateCommentInput) => {
    if (EMPTY_TEXT_REGEX.test(input.description)) return;

    // Bound when the write is issued, so a reply landing after the reader opened another thread is filed under
    // The comment it was written against rather than under whatever is on screen
    const { createComment: storeCreateComment } = getCommentOperationData(input.parentId);
    await executeCreateCommentMutation(() => $trpc.post.createComment.mutate(input), {
      key: Symbol("createComment"),
      onSuccess: ({ ancestorIds, comment }) => {
        storeCreateComment(comment);
        updateCommentCounts(ancestorIds, 1);
      },
    });
  };
  const updateComment = async (input: UpdateCommentInput, parentId: string) => {
    const { items: branchItems } = getSlice(parentId);
    const { updateComment: storeUpdateComment } = getCommentOperationData(parentId);
    await executeUpdateCommentMutation(() => $trpc.post.updateComment.mutate(input), {
      // Scoped to the one comment this write edits: a second edit of it queues behind the first, so its rollback
      // Has to restore what that one stored, and a whole-list restore would undo the branch's own paging
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
    const { createComment: storeCreateComment, deleteComment: storeDeleteComment } = getCommentOperationData(parentId);
    await executeDeleteCommentMutation(() => $trpc.post.deleteComment.mutate(input), {
      // The rows go at once and the counters when the server answers: a delete cascades, so how many rows it
      // Takes is only knowable there — whatever happens to be expanded here is short by every reply nobody opened
      applyOptimistic: () => {
        // The one row this write removes, read when the write is sent — deletes of different comments do not
        // Queue against each other
        const deletedComment = branchItems.value.find(({ id }) => id === input);
        deleteBranch(input);
        storeDeleteComment({ id: input });
        return () => {
          // Its own replies are not restored: `deleteBranch` left every branch beneath it unread, so re-opening
          // One reads it again
          if (deletedComment) storeCreateComment(deletedComment);
        };
      },
      key: input,
      onSuccess: ({ ancestorIds, removedCommentCount }) => {
        updateCommentCounts(ancestorIds, -removedCommentCount);
      },
    });
  };

  return {
    allComments,
    createComment,
    currentPost,
    deleteComment,
    getSlice,
    getSliceOperationData,
    updateComment,
  };
});
