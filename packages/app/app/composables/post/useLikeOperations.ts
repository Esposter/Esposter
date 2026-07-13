import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";
import type { PostWithRelations } from "@esposter/db-schema";

export const useLikeOperations = (allPosts: MaybeRefOrGetter<PostWithRelations[]>) => {
  const { $trpc } = useNuxtApp();
  const executeMutation = useMutation();

  // Server-generated like row — non-optimistic, applied in onSuccess
  const createLike = async (input: CreateLikeInput) => {
    await executeMutation(() => $trpc.like.createLike.mutate(input), {
      onSuccess: (newLike) => {
        const post = toValue(allPosts).find(({ id }) => id === newLike.postId);
        if (!post) return;

        post.viewerLike = newLike;
        post.noLikes += newLike.value;
      },
    });
  };
  const updateLike = async (input: UpdateLikeInput) => {
    const post = toValue(allPosts).find(({ id }) => id === input.postId);
    if (!post?.viewerLike) return;

    const previousViewerLike = post.viewerLike;
    await executeMutation(() => $trpc.like.updateLike.mutate(input), {
      applyOptimistic: () => {
        post.viewerLike = { ...previousViewerLike, value: input.value };
        post.noLikes += input.value * 2;
        return () => {
          post.viewerLike = previousViewerLike;
          post.noLikes -= input.value * 2;
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
    await executeMutation(() => $trpc.like.deleteLike.mutate(postId), {
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
