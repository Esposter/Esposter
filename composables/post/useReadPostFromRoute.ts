import { ErrorEntity } from "@/models/shared/error/ErrorEntity";
import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { getInvalidIdStatusMessage } from "@/services/shared/error/getInvalidIdStatusMessage";
import { uuidValidateV4 } from "@/util/uuid";

export const useReadPostFromRoute = async () => {
  const route = useRoute();
  const postId = route.params.id;
  if (!(typeof postId === "string" && uuidValidateV4(postId)))
    throw createError({ statusCode: 404, statusMessage: getInvalidIdStatusMessage(ErrorEntity.Post) });

  const { $client } = useNuxtApp();
  const post = await $client.post.readPost.query(postId);
  if (!post) throw createError({ statusCode: 404, statusMessage: getEntityNotFoundStatusMessage(ErrorEntity.Post) });

  if (post.parentId)
    throw createError({
      statusCode: 404,
      statusMessage: `${getEntityNotFoundStatusMessage(ErrorEntity.Post)}, you might be trying to find a comment`,
    });

  return post;
};
