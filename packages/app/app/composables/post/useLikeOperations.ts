import type { CreateLikeInput } from "#shared/models/db/post/CreateLikeInput";
import type { DeleteLikeInput } from "#shared/models/db/post/DeleteLikeInput";
import type { UpdateLikeInput } from "#shared/models/db/post/UpdateLikeInput";
import type { PostWithRelations } from "@esposter/db-schema";
import type { ReadonlyRefOrGetter } from "@vueuse/core";

import { authClient } from "@/services/auth/authClient";

export const useLikeOperations = (allPosts: ReadonlyRefOrGetter<PostWithRelations[]>) => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();

  const createLike = async (input: CreateLikeInput) => {
    const newLike = await $trpc.like.createLike.mutate(input);
    const post = toValue(allPosts).find(({ id }) => id === newLike.postId);
    if (!post) return;

    post.likes.push(newLike);
    post.noLikes += newLike.value;
  };
  const updateLike = async (input: UpdateLikeInput) => {
    const updatedLike = await $trpc.like.updateLike.mutate(input);
    const post = toValue(allPosts).find(({ id }) => id === updatedLike.postId);
    if (!post) return;

    const index = post.likes.findIndex(
      ({ postId, userId }) => userId === updatedLike.userId && postId === updatedLike.postId,
    );
    if (index === -1) return;

    Object.assign(post.likes[index], updatedLike);
    post.noLikes += updatedLike.value * 2;
  };
  const deleteLike = async (postId: DeleteLikeInput) => {
    const userId = session.value.data?.user.id;
    if (!userId) return;

    await $trpc.like.deleteLike.mutate(postId);

    const post = toValue(allPosts).find(({ id }) => id === postId);
    if (!post) return;

    const deletedLike = post.likes.find((l) => l.userId === userId && l.postId === postId);
    if (!deletedLike) return;

    post.likes = post.likes.filter((l) => !(l.userId === deletedLike.userId && l.postId === deletedLike.postId));
    post.noLikes -= deletedLike.value;
  };

  return {
    createLike,
    deleteLike,
    updateLike,
  };
};
