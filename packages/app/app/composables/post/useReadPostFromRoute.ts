import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useReadPostFromRoute = async () => {
  const { $trpc } = useNuxtApp();
  const route = useRoute();
  const postId = route.params.id as string;
  const post = await $trpc.post.readPost.query(postId);

  if (post.parentId)
    // @TODO: https://github.com/nuxt/nuxt/issues/34138
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw createError({
      status: 404,
      statusText: `${getEntityNotFoundStatusMessage(DatabaseEntityType.Post, postId)}, you might be trying to find a comment`,
    });

  return post;
};
