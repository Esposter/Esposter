import { getEntityNotFoundStatusMessage } from "@/services/shared/error/getEntityNotFoundStatusMessage";
import { requireRouteParam } from "@/util/router/requireRouteParam";
import { DatabaseEntityType } from "@esposter/db-schema";

export const useReadPostFromRoute = async () => {
  const { $trpc } = useNuxtApp();
  const { currentRoute } = useRouter();
  const postId = requireRouteParam(currentRoute.value.params, "id");
  const post = await $trpc.post.readPost.query(postId);

  if (post.parentId)
    throw createError({
      status: 404,
      statusText: `${getEntityNotFoundStatusMessage(DatabaseEntityType.Post, postId)}, you might be trying to find a comment`,
    });

  return post;
};
