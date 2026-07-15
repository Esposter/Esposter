import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";
import type { PostWithRelations } from "@esposter/db-schema";

export const useLikeOperations = (allPosts: MaybeRefOrGetter<PostWithRelations[]>) => {
  const { $trpc } = useNuxtApp();
  const executeCreateLikeMutation = useMutation();
  const executeUpdateLikeMutation = useMutation();
  const executeDeleteLikeMutation = useMutation();
  // CreateLike is non-optimistic (the row is server-generated), so viewerLike stays undefined for the whole
  // Round trip. Without this guard a rapid second vote sees viewerLike undefined too and fires another
  // CreateLike, hitting the likes primary-key constraint. Track in-flight posts so only the first create runs.
  const pendingCreatePostIds = new Set<PostWithRelations["id"]>();

  // Server-generated like row — non-optimistic, applied in onSuccess
  const createLike = async (input: CreateLikeInput) => {
    if (pendingCreatePostIds.has(input.postId)) return;
    pendingCreatePostIds.add(input.postId);
    await executeCreateLikeMutation(() => $trpc.like.createLike.mutate(input), {
      onSuccess: (newLike) => {
        const post = toValue(allPosts).find(({ id }) => id === newLike.postId);
        if (!post) return;

        post.viewerLike = newLike;
        post.noLikes += newLike.value;
      },
    });
    pendingCreatePostIds.delete(input.postId);
  };
  const updateLike = async (input: UpdateLikeInput) => {
    const post = toValue(allPosts).find(({ id }) => id === input.postId);
    if (!post?.viewerLike) return;

    const previousViewerLike = post.viewerLike;
    const delta = input.value - previousViewerLike.value;
    await executeUpdateLikeMutation(() => $trpc.like.updateLike.mutate(input), {
      applyOptimistic: () => {
        post.viewerLike = { ...previousViewerLike, value: input.value };
        post.noLikes += delta;
        return () => {
          post.viewerLike = previousViewerLike;
          post.noLikes -= delta;
        };
      },
      onSuccess: (updatedLike) => {
        post.viewerLike = updatedLike;
      },
    });
  };
  const deleteLike = async (postId: DeleteLikeInput) => {
    const post = toValue(allPosts).find(({ id }) => id === postId);
    if (!post?.viewerLike) return;

    const previousViewerLike = post.viewerLike;
    await executeDeleteLikeMutation(() => $trpc.like.deleteLike.mutate(postId), {
      applyOptimistic: () => {
        post.viewerLike = undefined;
        post.noLikes -= previousViewerLike.value;
        return () => {
          post.viewerLike = previousViewerLike;
          post.noLikes += previousViewerLike.value;
        };
      },
    });
  };

  return {
    createLike,
    deleteLike,
    updateLike,
  };
};
