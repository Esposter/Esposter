import type { CreatePostInput } from "#shared/models/db/post/CreatePostInput";
import type { DeletePostInput } from "#shared/models/db/post/DeletePostInput";
import type { UpdatePostInput } from "#shared/models/db/post/UpdatePostInput";
import type { PostKey } from "#src/models/post/PostKey";
import type { Page, PostInPostWithRelations } from "@esposter/db-schema";

import { PostSortType } from "#shared/models/post/PostSortType";
import { PostSortTypePageSortMap } from "#shared/services/post/PostSortTypePageSortMap";
import { usePostRows } from "#src/composables/post/usePostRows";
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { postTable } from "#src/services/post/overlay/constants";
import { getPostPatchEntry } from "#src/services/post/overlay/getPostPatchEntry";
import { createArrival } from "#src/services/shared/overlay/createArrival";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useOverlayStore } from "#src/store/overlay";
import { compareBySort } from "@esposter/db-schema";
import { omitUndefined, withFinalizerAsync } from "@esposter/shared";

// The feed is a list of post ids in the order its pages named them. Its rows are the overlay's, so a post a write or a
// Later read changes is drawn as it is, wherever else it is on screen
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
  // The post goes before the first held row the feed's sort places after it, and at the end when none is. A key whose
  // Row is not held cannot be ordered, so it is passed over
  const insertPostKey = (post: PostInPostWithRelations) => {
    const compare = compareBySort(PostSortTypePageSortMap[sortType.value]);
    const index = postKeys.value.findIndex(({ id }) => {
      const heldPost = getPostWithRelations(id);
      return heldPost !== undefined && compare(post, heldPost) < 0;
    });
    postKeys.value =
      index === -1 ? [...postKeys.value, { id: post.id }] : postKeys.value.toSpliced(index, 0, { id: post.id });
  };
  // The id only exists once the server has written the row, and the page that submitted the form needs it to open what
  // Was just posted. The new post joins the feed where its sort places it, and a rejected create hands back nothing.
  // Its alert has already been raised, so the caller's only job is to stay put
  const createPost = async (input: CreatePostInput): Promise<PostInPostWithRelations | undefined> => {
    const outcome: { post?: PostInPostWithRelations } = {};
    createPendingCount.value += 1;
    await withFinalizerAsync(
      () =>
        writeAwaited(
          async () => {
            const post = await $trpc.post.createPost.mutate(input);
            outcome.post = post;
            insertPostKey(post);
            return [createArrival(postTable, storePostRelations(post))];
          },
          { awaitedBecause: AwaitedReason.ServerIssuedValue, onError: createErrorAlert },
        ),
      () => {
        createPendingCount.value -= 1;
      },
    );
    return outcome.post;
  };
  // The edit is drawn over the row at once, and the server's copy of the row replaces it once it is kept, with the
  // Counts it carries. Only the fields the edit names are drawn
  const updatePost = (input: UpdatePostInput) => {
    updatePendingCount.value += 1;
    writeOptimistic(
      async () =>
        createRowResponse(
          postTable,
          storePostRelations(
            await withFinalizerAsync(
              () => $trpc.post.updatePost.mutate(input),
              () => {
                updatePendingCount.value -= 1;
              },
            ),
          ),
        ),
      {
        entry: getPostPatchEntry(input.id, omitUndefined({ description: input.description, title: input.title })),
        onError: createErrorAlert,
      },
    );
  };
  // The answer names each post the removal took, the post and every reply beneath it, and no entry can name the replies a
  // Removal takes, so the post stays on the feed until the server answers and leaves it then. A refused delete alerts and
  // Resolves false, which keeps the dialog asking open
  const deletePost = async (input: DeletePostInput) => {
    const outcome: { isRemoved?: boolean } = {};
    await writeAwaited(
      async () => {
        const removedPosts = await $trpc.post.deletePost.mutate(input);
        const removedIds = new Set(removedPosts.map(({ id }) => id));
        postKeys.value = postKeys.value.filter(({ id }) => !removedIds.has(id));
        outcome.isRemoved = true;
        return removedPosts.map((post) => createArrival(postTable, post));
      },
      { awaitedBecause: AwaitedReason.ServerDecidedOutcome, onError: createErrorAlert },
    );
    return outcome.isRemoved === true;
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
