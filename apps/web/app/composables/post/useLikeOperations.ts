import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";
import type { PostInPostWithRelations } from "@esposter/db-schema";

import { usePostCountStore } from "@/store/post/count";

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
  const { executeMutation: executeCreateLikeMutation } = useMutation();
  const { executeMutation: executeUpdateLikeMutation } = useMutation();
  const { executeMutation: executeDeleteLikeMutation } = useMutation();
  const postCountStore = usePostCountStore();
  const { refreshPostCounts } = postCountStore;
  // A list may hold the same object twice, and a copy changed twice would be rolled back against the wrong vote
  const getPosts = (postId: PostInPostWithRelations["id"]) => [
    ...new Set(toValue(allPosts).filter(({ id }) => id === postId)),
  ];
  // The vote's row is server-generated, so a create leaves viewerLike undefined for the whole round trip and a rapid
  // Second vote would fire another CreateLike, hitting the likes primary-key constraint. Keying the single-flight guard
  // By postId drops the duplicate create while the first is still in flight. Only the count moves at once
  const createLike = async (input: CreateLikeInput) => {
    await executeCreateLikeMutation(() => $trpc.like.createLike.mutate(input), {
      applyOptimistic: () => getRollback(getPosts(input.postId).map((post) => moveLikeCount(post, input.value))),
      isExclusive: true,
      key: input.postId,
      onSuccess: (newLike) => {
        for (const post of getPosts(newLike.postId)) post.viewerLike = newLike;
      },
    });
    // The count moved ahead of the write is the client's estimate of the vote's own effect, and the server's, which
    // Also holds every other viewer's votes, is what each copy is left with once it is read back
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
