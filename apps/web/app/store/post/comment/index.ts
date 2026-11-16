import type { CreateCommentInput } from "#shared/models/db/post/CreateCommentInput";
import type { DeleteCommentInput } from "#shared/models/db/post/DeleteCommentInput";
import type { UpdateCommentInput } from "#shared/models/db/post/UpdateCommentInput";
import type { PostInPostWithRelations } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { PostSortType } from "#shared/models/post/PostSortType";
import { getPostRanking } from "#shared/services/post/getPostRanking";
import { authClient } from "#src/services/auth/authClient";
import { applyPostCounts } from "#src/services/post/applyPostCounts";
import { postCountHooks } from "#src/services/post/postCountHooks";
import { createOperationData } from "#src/services/shared/createOperationData";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { usePostCountStore } from "#src/store/post/count";
import { usePostStore } from "#src/store/post/index";
import { EMPTY_TEXT_REGEX } from "#src/util/text/constants";
import { DerivedDatabaseEntityType } from "@esposter/db-schema";
import { v7 } from "uuid";

export const useCommentStore = defineStore("post/comment", () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const postStore = usePostStore();
  const postCountStore = usePostCountStore();
  const { refreshPostCounts } = postCountStore;
  const currentPost = ref<PostInPostWithRelations>();
  const commentSortType = ref<PostSortType>(PostSortType.Hot);
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

  const { executeMutation: executeCreateCommentMutation } = useMutation();
  const { executeMutation: executeUpdateCommentMutation } = useMutation();
  const { executeMutation: executeDeleteCommentMutation } = useMutation();
  // The comment is created under the id the client gives it and drawn at once: the reader is its author, it inherits
  // Its parent's chain, and a new reply has no votes or replies of its own. The counts it moves on the posts above it
  // Are the server's, so they are read back once it lands. `onRefused` hands the composer its text back
  const createComment = (input: Except<CreateCommentInput, "id">, onRefused?: () => void) => {
    if (EMPTY_TEXT_REGEX.test(input.description)) return;

    const user = session.value.data?.user;
    // Signed out while composing, so nothing is sent and the composer keeps its text
    if (!user) {
      onRefused?.();
      return;
    }
    // Bound when the write is issued, so a reply landing after the reader opened another thread is filed under
    // The comment it was written against rather than under whatever is on screen
    const {
      createComment: storeCreateComment,
      deleteComment: storeDeleteComment,
      updateComment: storeUpdateComment,
    } = getCommentOperationData(input.parentId);
    const parent = [...allComments.value, ...postStore.items].find(({ id }) => id === input.parentId);
    const createdAt = new Date();
    const newComment: PostInPostWithRelations = {
      ancestorIds: parent ? [...parent.ancestorIds, parent.id] : [input.parentId],
      commentCount: 0,
      createdAt,
      deletedAt: null,
      depth: parent ? parent.depth + 1 : 1,
      description: input.description,
      id: v7(),
      likeCount: 0,
      parentId: input.parentId,
      ranking: getPostRanking(0, createdAt),
      title: "",
      updatedAt: createdAt,
      user: {
        biography: user.biography,
        createdAt: user.createdAt,
        deletedAt: null,
        id: user.id,
        image: user.image ?? "",
        name: user.name,
        updatedAt: user.updatedAt,
      },
      userId: user.id,
    };
    executeCreateCommentMutation(() => $trpc.post.createComment.mutate({ ...input, id: newComment.id }), {
      applyOptimistic: () => {
        storeCreateComment(newComment);
        return () => {
          storeDeleteComment({ id: newComment.id });
          onRefused?.();
        };
      },
      key: newComment.id,
      reconcile: async ({ ancestorIds, comment }) => {
        storeUpdateComment(comment);
        await refreshPostCounts(ancestorIds);
      },
    });
  };
  const updateComment = (input: UpdateCommentInput, parentId: string) => {
    const { items: branchItems } = getSlice(parentId);
    const { updateComment: storeUpdateComment } = getCommentOperationData(parentId);
    executeUpdateCommentMutation(() => $trpc.post.updateComment.mutate(input), {
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
      // The server's copy of the row replaces the edit once it is kept, and the counts are read back beside it
      reconcile: async (updatedComment) => {
        storeUpdateComment(updatedComment);
        await refreshPostCounts([updatedComment.id]);
      },
    });
  };
  const deleteComment = (input: DeleteCommentInput, parentId: string) => {
    const { items: branchItems } = getSlice(parentId);
    const { createComment: storeCreateComment, deleteComment: storeDeleteComment } = getCommentOperationData(parentId);
    executeDeleteCommentMutation(() => $trpc.post.deleteComment.mutate(input), {
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
      reconcile: async ({ ancestorIds }) => {
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
    openPost,
    setCommentSortType,
    toggleCommentExpanded,
    updateComment,
  };
});
