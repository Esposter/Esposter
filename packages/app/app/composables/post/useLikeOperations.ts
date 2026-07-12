import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";
import type { PostWithRelations } from "@esposter/db-schema";

export const useLikeOperations = (allPosts: MaybeRefOrGetter<PostWithRelations[]>) => {
  const { $trpc } = useNuxtApp();

  const createLike = async (input: CreateLikeInput) => {
    const newLike = await $trpc.like.createLike.mutate(input);
    const post = toValue(allPosts).find(({ id }) => id === newLike.postId);
    if (!post) return;

    post.viewerLike = newLike;
    post.noLikes += newLike.value;
  };
  const updateLike = async (input: UpdateLikeInput) => {
    const updatedLike = await $trpc.like.updateLike.mutate(input);
    const post = toValue(allPosts).find(({ id }) => id === updatedLike.postId);
    if (!post) return;

    post.viewerLike = updatedLike;
    post.noLikes += updatedLike.value * 2;
  };
  const deleteLike = async (postId: DeleteLikeInput) => {
    const deletedLike = await $trpc.like.deleteLike.mutate(postId);
    const post = toValue(allPosts).find(({ id }) => id === postId);
    if (!post) return;

    post.viewerLike = undefined;
    post.noLikes -= deletedLike.value;
  };

  return {
    createLike,
    deleteLike,
    updateLike,
  };
};
