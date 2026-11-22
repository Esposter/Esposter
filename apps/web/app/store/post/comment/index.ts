import type { CreateCommentInput } from "#shared/models/db/post/CreateCommentInput";
import type { DeleteCommentInput } from "#shared/models/db/post/DeleteCommentInput";
import type { UpdateCommentInput } from "#shared/models/db/post/UpdateCommentInput";
import type { PostKey } from "#src/models/post/PostKey";
import type { Page, PostInPost, PostInPostWithRelations, PublicUser } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { PostSortType } from "#shared/models/post/PostSortType";
import { usePostRows } from "#src/composables/post/usePostRows";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { authClient } from "#src/services/auth/authClient";
import { postTable } from "#src/services/post/overlay/constants";
import { getSetPostEntry } from "#src/services/post/overlay/getSetPostEntry";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useUserStore } from "#src/store/message/user/index";
import { useOverlayStore } from "#src/store/overlay";
import { usePostCountStore } from "#src/store/post/count";
import { EMPTY_TEXT_REGEX } from "#src/util/text/constants";
import { NO_ROW_VERSION } from "@esposter/db-schema";
import { getPostRanking, getResultAsync } from "@esposter/shared";
import { v7 } from "uuid";

export const useCommentStore = defineStore("post/comment", () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const overlayStore = useOverlayStore();
  const { arrive, writeAwaited, writeOptimistic } = overlayStore;
  const postCountStore = usePostCountStore();
  const { refreshPostCountsInBackground } = postCountStore;
  const userStore = useUserStore();
  const { storeUser } = userStore;
  const { getPostWithRelations, postMap, storePostRelations } = usePostRows();
  const currentPostId = ref("");
  const currentPost = computed(() => (currentPostId.value ? getPostWithRelations(currentPostId.value) : undefined));
  const commentSortType = ref<PostSortType>(PostSortType.Hot);
  // Held here rather than in each card, so a card a re-read remounts comes back open
  const expandedCommentIds = ref(new Set<string>());
  // Keyed by the post whose replies the partition holds, the route's own post included. A partition holds the ids of its
  // Replies in the order its pages named them, and the rows are the overlay's
  const { getSlice, getSliceOperationData, keys } = useCursorPaginationDataMap<PostKey>();
  const toBranchPosts = (branchKeys: PostKey[]) =>
    branchKeys.flatMap(({ id }) => {
      const post = getPostWithRelations(id);
      return post ? [post] : [];
    });
  // A branch's replies in the order its page named them
  const getBranchItems = (parentId: string) => computed(() => toBranchPosts(getSlice(parentId).items.value));
  // The branch's reply the dialog names, while the branch still lists it
  const getBranchComment = (parentId: string, commentId: string) =>
    getSlice(parentId).items.value.some(({ id }) => id === commentId) ? getPostWithRelations(commentId) : undefined;
  const readCommentPage = ({ items: pageComments, ...page }: Page<PostInPostWithRelations>): Page<PostKey> => {
    for (const comment of pageComments) arrive(postTable, storePostRelations(comment));
    return { ...page, items: pageComments.map(({ id }) => ({ id })) };
  };
  // Drops the ids a removal names from every partition that lists them, so the removed replies leave every branch
  const dropBranchKeys = (removedIds: string[]) => {
    const removedIdSet = new Set(removedIds);
    for (const key of keys.value) {
      const branch = getSlice(key);
      branch.items.value = branch.items.value.filter(({ id }) => !removedIdSet.has(id));
    }
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
  // Only branches that already exist are descended into: asking the map for one that does not creates it, so a
  // Walk over the rows themselves would leave an empty partition behind for every reply it passed
  const deleteBranch = (parentId: string) => {
    const branchKeys = new Set(keys.value);
    const deleteLoadedBranch = (key: string) => {
      if (!branchKeys.has(key)) return;

      const { isLoaded, items: branchItems } = getSlice(key);
      for (const { id } of branchItems.value) deleteLoadedBranch(id);
      branchItems.value = [];
      // Emptied rather than kept: a branch that still says it is loaded is one a re-expansion will not read again, and the
      // Removal that calls this has taken the replies it held
      isLoaded.value = false;
    };
    deleteLoadedBranch(parentId);
  };
  // A visit starts at Hot with nothing open, whatever the last post was read under
  const openPost = (post: PostInPostWithRelations) => {
    arrive(postTable, storePostRelations(post));
    currentPostId.value = post.id;
    expandedCommentIds.value.clear();
    setCommentSortType(PostSortType.Hot);
  };
  // A read of the open post refreshes its row without reopening it, so the reader's expanded replies and sort survive
  const arrivePost = (post: PostInPostWithRelations) => {
    arrive(postTable, storePostRelations(post));
  };

  // The comment is drawn as it is sent: the reader is its author, it inherits its parent's chain, and a new reply has no
  // Votes or replies of its own. The counts it moves on the posts above it are the server's, so they are read back once
  // It lands. `onRefused` hands the composer its text back
  const createComment = (input: Except<CreateCommentInput, "id">, onRefused?: () => void) => {
    if (EMPTY_TEXT_REGEX.test(input.description)) return;

    const user = session.value.data?.user;
    // Signed out while composing, so nothing is sent and the composer keeps its text
    if (!user) {
      onRefused?.();
      return;
    }
    const parent = postMap.value.get(input.parentId);
    const createdAt = new Date();
    const publicUser: PublicUser = {
      biography: user.biography,
      createdAt: user.createdAt,
      deletedAt: null,
      id: user.id,
      image: user.image ?? "",
      name: user.name,
      updatedAt: user.updatedAt,
    };
    const newComment: PostInPost = {
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
      userId: user.id,
      version: NO_ROW_VERSION,
    };
    storeUser(publicUser);
    // The branch lists the reply at once, where its entry draws it. A refused reply stays listed as an id with no row,
    // Which the branch draws as nothing
    const branch = getSlice(input.parentId);
    branch.items.value = [...branch.items.value, { id: newComment.id }];
    writeOptimistic(
      async () => {
        const { ancestorIds, comment } = await $trpc.post.createComment.mutate({ ...input, id: newComment.id });
        refreshPostCountsInBackground(ancestorIds);
        return createRowResponse(postTable, storePostRelations(comment));
      },
      {
        entry: getSetPostEntry(newComment),
        onError: (error) => {
          createErrorAlert(error);
          onRefused?.();
        },
      },
    );
  };
  // The edit waits for the server's answer, since the editor that holds the draft stays open until it lands, and the
  // Branch then shows the stored text the server kept. A refused edit alerts and answers false
  const updateComment = (input: UpdateCommentInput) =>
    getResultAsync(() => $trpc.post.updateComment.mutate(input)).match(
      (comment) => {
        arrive(postTable, storePostRelations(comment));
        return true;
      },
      (error) => {
        createErrorAlert(error);
        return false;
      },
    );
  // The answer names each reply a removal takes as well as the comment and the posts above it, and no entry can name the
  // Replies, so the removal waits for the answer. The branch beneath the comment is emptied only once the server keeps the
  // Removal, and the counters above it are read back then
  const deleteComment = async (input: DeleteCommentInput) =>
    writeAwaited(
      async () => {
        const { ancestorIds, removedPosts } = await $trpc.post.deleteComment.mutate(input);
        refreshPostCountsInBackground(ancestorIds);
        deleteBranch(input);
        dropBranchKeys(removedPosts.map(({ id }) => id));
        return removedPosts.map((post) => createArrival(postTable, post));
      },
      { awaitedBecause: AwaitedReason.ServerDecidedOutcome, onError: createErrorAlert },
    );

  return {
    arrivePost,
    commentSortType,
    createComment,
    currentPost,
    deleteComment,
    expandedCommentIds,
    getBranchComment,
    getBranchItems,
    getSlice,
    getSliceOperationData,
    openPost,
    readCommentPage,
    setCommentSortType,
    toggleCommentExpanded,
    updateComment,
  };
});
