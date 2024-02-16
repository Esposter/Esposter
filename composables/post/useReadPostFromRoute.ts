import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { Entity } from "~/models/shared/Entity";

export const useReadPostFromRoute = async () => {
  const { $client } = useNuxtApp();
  const route = useRoute();
  const postId = route.params.id as string;
  const post = await $client.post.readPost.query(postId);
  if (!post) throw createError({ statusCode: 404, statusMessage: getEntityNotFoundStatusMessage(Entity.Post) });

  if (post.parentId)
    throw createError({
      statusCode: 404,
      statusMessage: `${getEntityNotFoundStatusMessage(Entity.Post)}, you might be trying to find a comment`,
    });

  return post;
};
