import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";
import type { PostWithRelations } from "@esposter/db-schema";

// Every copy's change is undone by its own rollback, in one call
const getRollback = (rollbacks: (() => void)[]) => () => {
  for (const rollback of rollbacks) rollback();
};
// A vote lands on every copy of its post the client holds — the feed's row and the post page's own read of it
// Are separate objects — so no list can show a count the other has already moved past. Each copy keeps its own
// Vote and count, so each is changed, and rolled back, against what it held
export const useLikeOperations = (allPosts: MaybeRefOrGetter<PostWithRelations[]>) => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeCreateLikeMutation } = useMutation();
  const { executeMutation: executeUpdateLikeMutation } = useMutation();
  const { executeMutation: executeDeleteLikeMutation } = useMutation();
  // A list may hold the same object twice, and a copy changed twice would move its count by twice the vote
  const getPosts = (postId: PostWithRelations["id"]) => [
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
        for (const post of getPosts(newLike.postId)) {
          post.viewerLike = newLike;
          post.likeCount += newLike.value;
        }
      },
    });
  };
  const updateLike = async (input: UpdateLikeInput) => {
    const posts = getPosts(input.postId);
    if (!posts.some(({ viewerLike }) => viewerLike)) return;

    await executeUpdateLikeMutation(() => $trpc.like.updateLike.mutate(input), {
      // The vote is read when the write is sent rather than when it was issued: a second vote on one post queues
      // Behind the first, so a value captured at click time is the one from before that vote landed, and both
      // The count delta and the rollback would be computed against a vote the server has already replaced
      applyOptimistic: () =>
        getRollback(
          posts.flatMap((post) => {
            const previousViewerLike = post.viewerLike;
            if (!previousViewerLike) return [];

            const delta = input.value - previousViewerLike.value;
            post.viewerLike = { ...previousViewerLike, value: input.value };
            post.likeCount += delta;
            return [
              () => {
                post.viewerLike = previousViewerLike;
                post.likeCount -= delta;
              },
            ];
          }),
        ),
      key: input.postId,
      onSuccess: (updatedLike) => {
        for (const post of posts) post.viewerLike = updatedLike;
      },
    });
  };
  const deleteLike = async (postId: DeleteLikeInput) => {
    const posts = getPosts(postId);
    if (!posts.some(({ viewerLike }) => viewerLike)) return;

    await executeDeleteLikeMutation(() => $trpc.like.deleteLike.mutate(postId), {
      // Read when the write is sent, so a second delete queued behind the first finds the vote already gone and
      // Withdraws nothing — captured at click time it would subtract the same vote from the count twice, and
      // Roll a rejection back onto a like the first delete already removed
      applyOptimistic: () =>
        getRollback(
          posts.flatMap((post) => {
            const previousViewerLike = post.viewerLike;
            if (!previousViewerLike) return [];

            post.viewerLike = undefined;
            post.likeCount -= previousViewerLike.value;
            return [
              () => {
                post.viewerLike = previousViewerLike;
                post.likeCount += previousViewerLike.value;
              },
            ];
          }),
        ),
      key: postId,
    });
  };

  return {
    createLike,
    deleteLike,
    updateLike,
  };
};
