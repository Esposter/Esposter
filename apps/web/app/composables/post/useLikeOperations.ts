import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";
import type { PostInPostWithRelations } from "@esposter/db-schema";

import { createBatchedRefresh } from "@/services/shared/createBatchedRefresh";

// Every copy's change is undone by its own rollback, in one call
const getRollback = (rollbacks: (() => void)[]) => () => {
  for (const rollback of rollbacks) rollback();
};
// A vote lands on every copy of its post the client holds — the feed's row and the post page's own read of it
// Are separate objects — so no list can show a vote the other has already moved past. Each copy keeps its own vote,
// So each is changed, and rolled back, against what it held
export const useLikeOperations = (allPosts: MaybeRefOrGetter<PostInPostWithRelations[]>) => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeCreateLikeMutation } = useMutation();
  const { executeMutation: executeUpdateLikeMutation } = useMutation();
  const { executeMutation: executeDeleteLikeMutation } = useMutation();
  // A list may hold the same object twice, and a copy changed twice would be rolled back against the wrong vote
  const getPosts = (postId: PostInPostWithRelations["id"]) => [
    ...new Set(toValue(allPosts).filter(({ id }) => id === postId)),
  ];
  // The count is never moved here: the server adjusts it in the write that changes the vote, and another viewer's vote
  // Changes it too. Once a vote settles the count is read back, so the copies show what the server holds. Only the
  // Viewer's own vote is set at once, since the client holds that exactly
  const refreshLikeCounts = createBatchedRefresh(async (postIds: string[]) => {
    const postCounts = await $trpc.post.readPostCounts.query(postIds);
    for (const { id, likeCount } of postCounts) for (const post of getPosts(id)) post.likeCount = likeCount;
  });
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
    await refreshLikeCounts([input.postId]);
  };
  const updateLike = async (input: UpdateLikeInput) => {
    const posts = getPosts(input.postId);
    if (!posts.some(({ viewerLike }) => viewerLike)) return;

    await executeUpdateLikeMutation(() => $trpc.like.updateLike.mutate(input), {
      // The vote is read when the write is sent rather than when it was issued: a second vote on one post queues
      // Behind the first, so a value captured at click time is the one from before that vote landed, and the rollback
      // Would restore a vote the server has already replaced
      applyOptimistic: () =>
        getRollback(
          posts.flatMap((post) => {
            const previousViewerLike = post.viewerLike;
            if (!previousViewerLike) return [];

            post.viewerLike = { ...previousViewerLike, value: input.value };
            return [
              () => {
                post.viewerLike = previousViewerLike;
              },
            ];
          }),
        ),
      key: input.postId,
      onSuccess: (updatedLike) => {
        for (const post of posts) post.viewerLike = updatedLike;
      },
    });
    await refreshLikeCounts([input.postId]);
  };
  const deleteLike = async (postId: DeleteLikeInput) => {
    const posts = getPosts(postId);
    if (!posts.some(({ viewerLike }) => viewerLike)) return;

    await executeDeleteLikeMutation(() => $trpc.like.deleteLike.mutate(postId), {
      // Read when the write is sent, so a second delete queued behind the first finds the vote already gone and
      // Withdraws nothing, rather than rolling a rejection back onto a like the first delete already removed
      applyOptimistic: () =>
        getRollback(
          posts.flatMap((post) => {
            const previousViewerLike = post.viewerLike;
            if (!previousViewerLike) return [];

            post.viewerLike = undefined;
            return [
              () => {
                post.viewerLike = previousViewerLike;
              },
            ];
          }),
        ),
      key: postId,
    });
    await refreshLikeCounts([postId]);
  };

  return { createLike, deleteLike, updateLike };
};
