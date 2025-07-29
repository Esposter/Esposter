import { DatabaseEntityType } from "#shared/models/entity/DatabaseEntityType";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";

export const useReadPostFromRoute = async () => {
  const { $trpc } = useNuxtApp();
  const route = useRoute();
  const postId = route.params.id as string;
  const post = await $trpc.post.readPost.query(postId);

  if (post.parentId)
    throw createError({
      message: `${getEntityNotFoundStatusMessage(DatabaseEntityType.Post, postId)}, you might be trying to find a comment`,
      statusCode: 404,
    });

  return post;
};
