import { requireRouteParam } from "@/util/router/requireRouteParam";

// A comment is a post, so this returns one either way: opening a reply's own id renders it as the root of its
// Thread with its replies beneath, which is what "continue this thread" is — the same page, one level of
// Context instead of ten, and no route of its own
export const useReadPostFromRoute = () => {
  const { $trpc } = useNuxtApp();
  const { currentRoute } = useRouter();
  const postId = requireRouteParam(currentRoute.value.params, "id");
  return $trpc.post.readPost.query(postId);
};
