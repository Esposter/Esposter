import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";
import type { PostWithRelations } from "@esposter/db-schema";

export const useLikeOperations = (allPosts: MaybeRefOrGetter<PostWithRelations[]>) => {
  const { $trpc } = useNuxtApp();
  const { executeMutation: executeCreateLikeMutation } = useMutation();
  const { executeMutation: executeUpdateLikeMutation } = useMutation();
  const { executeMutation: executeDeleteLikeMutation } = useMutation();
  // CreateLike is non-optimistic (the row is server-generated), so viewerLike stays undefined for the whole
  // Round trip and a rapid second vote would fire another CreateLike, hitting the likes primary-key constraint.
  // Keying the single-flight guard by postId drops the duplicate create while the first is still in flight.
  const createLike = async (input: CreateLikeInput) => {
    await executeCreateLikeMutation(() => $trpc.like.createLike.mutate(input), {
      isExclusive: true,
      key: input.postId,
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
      key: input.postId,
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
      key: postId,
    });
  };

  return {
    createLike,
    deleteLike,
    updateLike,
  };
};
