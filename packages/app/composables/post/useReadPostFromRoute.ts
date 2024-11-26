import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { DatabaseEntityType } from "@/shared/models/entity/DatabaseEntityType";

export const useReadPostFromRoute = async () => {
  const { $client } = useNuxtApp();
  const route = useRoute();
  const postId = route.params.id as string;
  const post = await $client.post.readPost.query(postId);
  if (!post)
    throw createError({
      statusCode: 404,
      statusMessage: getEntityNotFoundStatusMessage(DatabaseEntityType.Post, postId),
    });

  if (post.parentId)
    throw createError({
      statusCode: 404,
      statusMessage: `${getEntityNotFoundStatusMessage(DatabaseEntityType.Post, postId)}, you might be trying to find a comment`,
    });

  return post;
};
