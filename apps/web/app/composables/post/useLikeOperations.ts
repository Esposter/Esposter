import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";
import type { LikeInPost, PostInPostWithRelations } from "@esposter/db-schema";

import { authClient } from "#src/services/auth/authClient";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { usePostCountStore } from "#src/store/post/count";
import { noop } from "@esposter/shared";

// Every copy's change is undone by its own rollback, in one call
const getRollback = (rollbacks: (() => void)[]) => () => {
  for (const rollback of rollbacks) rollback();
};
// Moves one copy's count by the change its viewer's own vote makes, which the client holds exactly, and returns the
// Rollback that restores the count the copy held. The count the server reads back is what the copy is left with
const moveLikeCount = (post: PostInPostWithRelations, delta: number) => {
  const previousLikeCount = post.likeCount;
  // eslint-disable-next-line no-restricted-syntax -- the viewer's own vote moves the count before the server answers, and the read-back replaces it
  post.likeCount += delta;
  return () => {
    post.likeCount = previousLikeCount;
  };
};
// Writes the viewer's new vote onto each copy, moves its count by the vote, and returns the rollback that restores what
// Each copy held
const applyOptimisticNewLike = (posts: PostInPostWithRelations[], newLike: LikeInPost) => {
  const rollbacks: (() => void)[] = [];
  for (const post of posts) {
    const previousViewerLike = post.viewerLike;
    post.viewerLike = newLike;
    rollbacks.push(moveLikeCount(post, newLike.value), () => {
      post.viewerLike = previousViewerLike;
    });
  }
  return getRollback(rollbacks);
};
// Writes the next vote onto each copy that holds one, moves its count by the difference, and returns the rollback that
// Restores what each copy held
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

    const nextViewerLike = getNextViewerLike(previousViewerLike);
    post.viewerLike = nextViewerLike;
    rollbacks.push(moveLikeCount(post, (nextViewerLike?.value ?? 0) - previousViewerLike.value), () => {
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
  const session = authClient.useSession();
  const { executeMutation: executeCreateLikeMutation } = useMutation();
  const { executeMutation: executeUpdateLikeMutation } = useMutation();
  const { executeMutation: executeDeleteLikeMutation } = useMutation();
  const postCountStore = usePostCountStore();
  const { refreshPostCounts } = postCountStore;
  // A list may hold the same object twice, and a copy changed twice would be rolled back against the wrong vote
  const getPosts = (postId: PostInPostWithRelations["id"]) => [
    ...new Set(toValue(allPosts).filter(({ id }) => id === postId)),
  ];
  // A refused vote rolls its count back to the copy's own estimate, which another viewer's vote may have moved since, so
  // The count is read back on a refusal as it is on a kept vote
  const getOnVoteError = (postId: PostInPostWithRelations["id"]) => async (error: Error) => {
    createErrorAlert(error);
    await refreshPostCounts([postId]);
  };
  // The viewer's own vote is drawn on every copy at once, with its count. A rapid second create would otherwise send
  // Another CreateLike and hit the likes primary-key constraint, so the single-flight guard keyed by postId drops it
  // While the first is still in flight
  const createLike = (input: CreateLikeInput) => {
    executeCreateLikeMutation(() => $trpc.like.createLike.mutate(input), {
      applyOptimistic: () => {
        const userId = session.value.data?.user.id;
        if (!userId) return noop;

        // The row's times are the client's estimate until the server's copy replaces it in `reconcile`
        const now = new Date();
        return applyOptimisticNewLike(getPosts(input.postId), {
          createdAt: now,
          deletedAt: null,
          postId: input.postId,
          updatedAt: now,
          userId,
          value: input.value,
        });
      },
      isExclusive: true,
      key: input.postId,
      onError: getOnVoteError(input.postId),
      // The server's row replaces the drawn vote, and the counts are read back once the vote is kept. The count moved
      // Ahead of the write is the client's estimate of the vote's own effect, and the server's, which also holds every
      // Other viewer's votes, is what each copy is left with once it is read back
      reconcile: async (newLike) => {
        for (const post of getPosts(newLike.postId)) post.viewerLike = newLike;
        await refreshPostCounts([input.postId]);
      },
    });
  };
  const updateLike = (input: UpdateLikeInput) => {
    const posts = getPosts(input.postId);
    if (!posts.some(({ viewerLike }) => viewerLike)) return;

    executeUpdateLikeMutation(() => $trpc.like.updateLike.mutate(input), {
      // The vote is read when the write is sent rather than when it was issued: a second vote on one post queues
      // Behind the first, so a value captured at click time is the one from before that vote landed, and the rollback
      // Would restore a vote the server has already replaced
      applyOptimistic: () =>
        applyOptimisticViewerLike(posts, (previousViewerLike) => ({ ...previousViewerLike, value: input.value })),
      key: input.postId,
      onError: getOnVoteError(input.postId),
      reconcile: async (updatedLike) => {
        for (const post of posts) post.viewerLike = updatedLike;
        await refreshPostCounts([input.postId]);
      },
    });
  };
  const deleteLike = (postId: DeleteLikeInput) => {
    const posts = getPosts(postId);
    if (!posts.some(({ viewerLike }) => viewerLike)) return;

    executeDeleteLikeMutation(() => $trpc.like.deleteLike.mutate(postId), {
      // Read when the write is sent, so a second delete queued behind the first finds the vote already gone and
      // Withdraws nothing, rather than rolling a rejection back onto a like the first delete already removed
      applyOptimistic: () => applyOptimisticViewerLike(posts, () => undefined),
      key: postId,
      onError: getOnVoteError(postId),
      reconcile: () => refreshPostCounts([postId]),
    });
  };

  return { createLike, deleteLike, updateLike };
};
