import type { CreateCommentInput } from "#shared/models/db/post/CreateCommentInput";
import type { DeleteCommentInput } from "#shared/models/db/post/DeleteCommentInput";
import type { UpdateCommentInput } from "#shared/models/db/post/UpdateCommentInput";
import type { PostInPostWithRelations } from "@esposter/db-schema";

import { PostSortType } from "@/models/post/PostSortType";
import { MutationStatus } from "@/models/shared/MutationStatus";
import { applyPostCounts } from "@/services/post/applyPostCounts";
import { postCountHooks } from "@/services/post/postCountHooks";
import { createOperationData } from "@/services/shared/createOperationData";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { usePostCountStore } from "@/store/post/count";
import { EMPTY_TEXT_REGEX } from "@/util/text/constants";
import { DerivedDatabaseEntityType } from "@esposter/db-schema";

export const useCommentStore = defineStore("post/comment", () => {
  const { $trpc } = useNuxtApp();
  const postCountStore = usePostCountStore();
  const { refreshPostCounts } = postCountStore;
  const currentPost = ref<PostInPostWithRelations>();
  const commentSortType = ref(PostSortType.Hot);
  // Held here rather than in each card, so a card a re-read remounts comes back open
  const expandedCommentIds = ref(new Set<string>());
  // Keyed by the post whose replies the partition holds, the route's own post included
  const { getSlice, getSliceOperationData, keys } = useCursorPaginationDataMap<PostInPostWithRelations>();
  const getCommentOperationData = (parentId: string) =>
    createOperationData(getSlice(parentId).items, ["id"], DerivedDatabaseEntityType.Comment);
  const allComments = computed(() => {
    const comments = currentPost.value ? [currentPost.value] : [];
    for (const key of keys.value) comments.push(...getSlice(key).items.value);
    return comments;
  });
  // The thread's copies take the counts the server returns, so a reply here reaches the post and the replies it sits under
  postCountHooks.register((postCounts) => {
    applyPostCounts(allComments.value, postCounts);
  });
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

  // Every loaded branch is read again under the new order, from its first page, so none keeps the rows the old order read
  const setCommentSortType = (sortType: PostSortType) => {
    commentSortType.value = sortType;
    for (const key of keys.value) getSlice(key).resetCursorPaginationData();
  };
  const toggleCommentExpanded = (commentId: string) => {
    if (expandedCommentIds.value.has(commentId)) expandedCommentIds.value.delete(commentId);
    else expandedCommentIds.value.add(commentId);
  };
  // A visit starts at Hot with nothing open, whatever the last post was read under
  const openPost = (post: PostInPostWithRelations) => {
    currentPost.value = post;
    expandedCommentIds.value.clear();
    setCommentSortType(PostSortType.Hot);
  };

  const { executeMutation: executeCreateCommentMutation, isPending: isCreateCommentPending } = useMutation();
  const { executeMutation: executeUpdateCommentMutation } = useMutation();
  const { executeMutation: executeDeleteCommentMutation } = useMutation();
  const createComment = async (input: CreateCommentInput) => {
    if (EMPTY_TEXT_REGEX.test(input.description)) return false;
    // Bound when the write is issued, so a reply landing after the reader opened another thread is filed under
    // The comment it was written against rather than under whatever is on screen
    const { createComment: storeCreateComment } = getCommentOperationData(input.parentId);
    const outcome = await executeCreateCommentMutation(() => $trpc.post.createComment.mutate(input), {
      key: Symbol("createComment"),
      onSuccess: async ({ ancestorIds, comment }) => {
        storeCreateComment(comment);
        await refreshPostCounts(ancestorIds);
      },
    });
    return outcome.status === MutationStatus.Succeeded;
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
      onSuccess: async (updatedComment) => {
        storeUpdateComment(updatedComment);
        await refreshPostCounts([updatedComment.id]);
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
      onError: async (error) => {
        createErrorAlert(error);
        // The rollback put this comment back with the counts it held when the delete was sent.
        // A count that moved since reached no copy, because the comment was not in the thread then
        await refreshPostCounts([input]);
      },
      onSuccess: async ({ ancestorIds }) => {
        await refreshPostCounts(ancestorIds);
      },
    });
  };

  return {
    allComments,
    commentSortType,
    createComment,
    currentPost,
    deleteComment,
    expandedCommentIds,
    getSlice,
    getSliceOperationData,
    isCreateCommentPending,
    openPost,
    setCommentSortType,
    toggleCommentExpanded,
    updateComment,
  };
});
