import { ErrorEntity } from "@/models/shared/error/ErrorEntity";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";

export const useReadPostFromRoute = async () => {
  const { $client } = useNuxtApp();
  const route = useRoute();
  const postId = route.params.id as string;
  const post = await $client.post.readPost.query(postId);
  if (!post) throw createError({ statusCode: 404, statusMessage: getEntityNotFoundStatusMessage(ErrorEntity.Post) });

  if (post.parentId)
    throw createError({
      statusCode: 404,
      statusMessage: `${getEntityNotFoundStatusMessage(ErrorEntity.Post)}, you might be trying to find a comment`,
    });

  return post;
};
