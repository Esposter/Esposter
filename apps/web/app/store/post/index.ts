import type { CreatePostInput } from "#shared/models/db/post/CreatePostInput";
import type { DeletePostInput } from "#shared/models/db/post/DeletePostInput";
import type { UpdatePostInput } from "#shared/models/db/post/UpdatePostInput";
import type { PostKey } from "#src/models/post/PostKey";
import type { Page, PostInPostWithRelations } from "@esposter/db-schema";

import { PostSortType } from "#shared/models/post/PostSortType";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { usePostRows } from "#src/composables/post/usePostRows";
import { postTable } from "#src/services/post/overlay/constants";
import { getPostPatchEntry } from "#src/services/post/overlay/getPostPatchEntry";
import { useOverlayStore } from "#src/store/overlay";
import { omitUndefined } from "@esposter/shared";

// The feed is a list of post ids in the order its pages named them. Its rows are the overlay's, so a post a write or a
// later read changes is drawn as it is, wherever else it is on screen
export const usePostStore = defineStore("post", () => {
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { arrive, writeAwaited, writeOptimistic } = overlayStore;
  const { getPostWithRelations, storePostRelations } = usePostRows();
  const sortType = ref<PostSortType>(PostSortType.Hot);
  const {
    hasMore,
    items: postKeys,
    readItems,
    readMoreItems,
    resetCursorPaginationData,
  } = useCursorPaginationData<PostKey>();
  const items = computed(() =>
    postKeys.value.flatMap(({ id }) => {
      const post = getPostWithRelations(id);
      return post ? [post] : [];
    }),
  );
  // Writes in flight, for the form's own pending state: an awaited create has no entry to say it is pending
  const createPendingCount = ref(0);
  const updatePendingCount = ref(0);
  const isCreatePostPending = computed(() => createPendingCount.value > 0);
  const isUpdatePostPending = computed(() => updatePendingCount.value > 0);
  // A page of the feed arrives row by row, and the feed keeps the ids the page named, in the order the server gave them
  const readPostPage = ({ items: pagePosts, ...page }: Page<PostInPostWithRelations>): Page<PostKey> => {
    for (const post of pagePosts) arrive(postTable, storePostRelations(post));
    return { ...page, items: pagePosts.map(({ id }) => ({ id })) };
  };
  // The id only exists once the server has written the row, and the page that submitted the form needs it to open what
  // was just posted. The new post joins the end of the feed as the server answered it, and a rejected create hands back
  // nothing: its alert has already been raised, so the caller's only job is to stay put
  const createPost = async (input: CreatePostInput): Promise<PostInPostWithRelations | undefined> => {
    const outcome: { post?: PostInPostWithRelations } = {};
    createPendingCount.value += 1;
    await writeAwaited(
      async () => {
        const post = await $trpc.post.createPost.mutate(input);
        outcome.post = post;
        postKeys.value = [...postKeys.value, { id: post.id }];
        return [createArrival(postTable, storePostRelations(post))];
      },
      { onError: createErrorAlert },
    ).finally(() => {
      createPendingCount.value -= 1;
    });
    return outcome.post;
  };
  // The edit is drawn over the row at once, and the server's copy of the row replaces it once it is kept, with the
  // counts it carries. Only the fields the edit names are drawn
  const updatePost = (input: UpdatePostInput) => {
    updatePendingCount.value += 1;
    writeOptimistic(
      async () => {
        try {
          return createRowResponse(postTable, storePostRelations(await $trpc.post.updatePost.mutate(input)));
        } finally {
          updatePendingCount.value -= 1;
        }
      },
      {
        entry: getPostPatchEntry(input.id, omitUndefined({ description: input.description, title: input.title })),
        onError: createErrorAlert,
      },
    );
  };
  // The post leaves the feed at once: its row is drawn removed, and the keys the server's answer names leave the list
  // when it is kept. A refused delete restores nothing, since the row was never changed on the server and the entry
  // dropping at once leaves the row as held
  const deletePost = (input: DeletePostInput) => {
    writeOptimistic(
      async () => {
        const removedIds = new Set(await $trpc.post.deletePost.mutate(input));
        postKeys.value = postKeys.value.filter(({ id }) => !removedIds.has(id));
        return { arrivals: [], confirmed: [] };
      },
      { entry: getPostPatchEntry(input, { deletedAt: new Date() }), onError: createErrorAlert },
    );
  };
  return {
    createPost,
    deletePost,
    hasMore,
    isCreatePostPending,
    isUpdatePostPending,
    items,
    readItems,
    readMoreItems,
    readPostPage,
    resetCursorPaginationData,
    sortType,
    updatePost,
  };
});
