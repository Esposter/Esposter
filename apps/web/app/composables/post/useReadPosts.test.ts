// @vitest-environment nuxt
import { PostSortType } from "#shared/models/post/PostSortType";
import { useReadPosts } from "#src/composables/post/useReadPosts";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { usePostStore } from "#src/store/post/index";
import { createEmptyPage } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(useReadPosts, () => {
  const { trpcMsw } = setupMswTrpc();

  // The list's sort change refreshes its first page, so the refresh must ask for the sort the list names now, not the
  // One The first page was read with
  test("a refresh after a sort change reads the sort the list names now", async () => {
    expect.hasAssertions();

    const sentSortNames: PostSortType[] = [];
    trpcMsw.post.readPosts.query(({ input }) => {
      sentSortNames.push(z.enum(PostSortType).parse(input?.sortName));
      return createEmptyPage();
    });
    const postStore = usePostStore();
    const { sortType } = storeToRefs(postStore);
    const { resetCursorPaginationData } = postStore;
    const { readPosts } = useReadPosts();
    const { refresh } = await readPosts();
    sortType.value = PostSortType.New;
    resetCursorPaginationData();
    await refresh();

    expect(sentSortNames).toStrictEqual([PostSortType.Hot, PostSortType.New]);
  });
});
