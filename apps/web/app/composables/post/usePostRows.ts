import type { Draft } from "#src/models/shared/overlay/Draft";
import type { LikeInPost, PostInPost, PostInPostWithRelations } from "@esposter/db-schema";

import { useSessionUserId } from "#src/composables/auth/useSessionUserId";
import { likeTable, postTable } from "#src/services/post/overlay/constants";
import { useUserStore } from "#src/store/message/user/index";
import { useOverlayStore } from "#src/store/overlay";
import { usePostCountStore } from "#src/store/post/count";
import { NO_ROW_VERSION } from "@esposter/db-schema";

// The post rows the feed, the threads and the post page hold, read back as posts with their relations. An author is the
// User store's row, the counts are the count store's, and the viewer's vote is the vote row the overlay holds, so the
// Row itself keeps none of them. A removed vote is a tombstone the overlay leaves out, so it reads as no vote
export const usePostRows = () => {
  const userId = useSessionUserId();
  const overlayStore = useOverlayStore();
  const { arrive, view } = overlayStore;
  const userStore = useUserStore();
  const { userMap } = storeToRefs(userStore);
  const { storeUser } = userStore;
  const postCountStore = usePostCountStore();
  const { postCounts } = storeToRefs(postCountStore);
  const { setPostCounts } = postCountStore;
  const postRows = view(postTable);
  const likeRows = view(likeTable);
  // A row an entry drew without a version is below every version, as a placeholder is
  const postMap = computed(
    () => new Map(postRows.value.map((post): [string, Readonly<Draft<PostInPost>>] => [post.id, post])),
  );
  // A guest's pending vote is drawn under the empty id, so the viewer's own vote is read only for a signed-in viewer
  const viewerLikeMap = computed(
    () =>
      new Map(
        likeRows.value
          .filter((like) => Boolean(userId.value) && like.userId === userId.value)
          .map((like): [string, LikeInPost] => [like.postId, { ...like, version: like.version ?? NO_ROW_VERSION }]),
      ),
  );
  const toPostWithRelations = (post: Readonly<Draft<PostInPost>>): PostInPostWithRelations | undefined => {
    const user = userMap.value.get(post.userId);
    if (!user) return undefined;

    // The store holds the newest counts it has seen, by version, so a count at the row's version or a later one is the
    // Count drawn
    const version = post.version ?? NO_ROW_VERSION;
    const counts = postCounts.value.get(post.id);
    const isCountCurrent = counts !== undefined && counts.version >= version;
    return {
      ...post,
      commentCount: isCountCurrent ? counts.commentCount : post.commentCount,
      likeCount: isCountCurrent ? counts.likeCount : post.likeCount,
      user,
      version,
      viewerLike: viewerLikeMap.value.get(post.id),
    };
  };
  // Stores what a read or a write returned beside its post: the author, the counts, and the viewer's vote. It returns
  // The post row the overlay holds, which the caller arrives
  const storePostRelations = ({ user, viewerLike, ...post }: PostInPostWithRelations): PostInPost => {
    storeUser(user);
    setPostCounts([post]);
    if (viewerLike) arrive(likeTable, viewerLike);
    return post;
  };
  const getPostWithRelations = (id: PostInPost["id"]) => {
    const post = postMap.value.get(id);
    return post && toPostWithRelations(post);
  };
  return { getPostWithRelations, postMap, storePostRelations };
};
