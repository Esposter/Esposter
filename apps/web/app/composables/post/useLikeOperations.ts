import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";
import type { PostInPostWithRelations } from "@esposter/db-schema";

import { usePostCountStore } from "@/store/post/count";

// Every copy's change is undone by its own rollback, in one call
const getRollback = (rollbacks: (() => void)[]) => () => {
  for (const rollback of rollbacks) rollback();
};
// Writes the next vote onto each copy that holds one and returns the rollback that restores what each copy held
const applyOptimisticViewerLike = (
  posts: PostInPostWithRelations[],
  getNextViewerLike: (
    previousViewerLike: NonNullable<PostInPostWithRelations["viewerLike"]>,
  ) => PostInPostWithRelations["viewerLike"],
) => {
  const rollbacks: (() => void)[] = [];
  for (const post of posts) {
    const previousViewerLike = post.viewerLike;
    if (!previousViewerLike) continue;

    post.viewerLike = getNextViewerLike(previousViewerLike);
    rollbacks.push(() => {
      post.viewerLike = previousViewerLike;
    });
  }
  return getRollback(rollbacks);
};
// A vote lands on every copy of its post the client holds — the feed's row and the post page's own read of it
// Are separate objects — so no list can show a vote the other has already moved past. Each copy keeps its own vote,
// So each is changed, and rolled back, against what it held
export const useLikeOperations = (allPosts: MaybeRefOrGetter<PostInPostWithRelations[]>) => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeCreateLikeMutation } = useMutation();
  const { executeMutation: executeUpdateLikeMutation } = useMutation();
  const { executeMutation: executeDeleteLikeMutation } = useMutation();
  const postCountStore = usePostCountStore();
  const { refreshPostCounts } = postCountStore;
  // A list may hold the same object twice, and a copy changed twice would be rolled back against the wrong vote
  const getPosts = (postId: PostInPostWithRelations["id"]) => [
    ...new Set(toValue(allPosts).filter(({ id }) => id === postId)),
  ];
  // `createLike` is non-optimistic (the row is server-generated), so viewerLike stays undefined for the whole
  // Round trip and a rapid second vote would fire another CreateLike, hitting the likes primary-key constraint.
  // Keying the single-flight guard by postId drops the duplicate create while the first is still in flight.
  const createLike = async (input: CreateLikeInput) => {
    await executeCreateLikeMutation(() => $trpc.like.createLike.mutate(input), {
      isExclusive: true,
      key: input.postId,
      onSuccess: (newLike) => {
        for (const post of getPosts(newLike.postId)) post.viewerLike = newLike;
      },
    });
    // The counts are never moved here: the server adjusts them in the write that changes the vote, so they are read back
    await refreshPostCounts([input.postId]);
  };
  const updateLike = async (input: UpdateLikeInput) => {
    const posts = getPosts(input.postId);
    if (!posts.some(({ viewerLike }) => viewerLike)) return;

    await executeUpdateLikeMutation(() => $trpc.like.updateLike.mutate(input), {
      // The vote is read when the write is sent rather than when it was issued: a second vote on one post queues
      // Behind the first, so a value captured at click time is the one from before that vote landed, and the rollback
      // Would restore a vote the server has already replaced
      applyOptimistic: () =>
        applyOptimisticViewerLike(posts, (previousViewerLike) => ({ ...previousViewerLike, value: input.value })),
      key: input.postId,
      onSuccess: (updatedLike) => {
        for (const post of posts) post.viewerLike = updatedLike;
      },
    });
    await refreshPostCounts([input.postId]);
  };
  const deleteLike = async (postId: DeleteLikeInput) => {
    const posts = getPosts(postId);
    if (!posts.some(({ viewerLike }) => viewerLike)) return;

    await executeDeleteLikeMutation(() => $trpc.like.deleteLike.mutate(postId), {
      // Read when the write is sent, so a second delete queued behind the first finds the vote already gone and
      // Withdraws nothing, rather than rolling a rejection back onto a like the first delete already removed
      applyOptimistic: () => applyOptimisticViewerLike(posts, () => undefined),
      key: postId,
    });
    await refreshPostCounts([postId]);
  };

  return { createLike, deleteLike, updateLike };
};
