// @vitest-environment nuxt
import PostList from "@/components/Post/List.vue";
import UiSelect from "@/components/Ui/Select/Index.vue";
import { PostSortType } from "@/models/post/PostSortType";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("postList", () => {
  const { trpcMsw } = setupMswTrpc();

  test("Feed Sort by omits Old", async () => {
    expect.hasAssertions();

    trpcMsw.post.readPosts.query(() => new CursorPaginationData());
    const component = await mountSuspended(PostList);
    const items = component.findComponent(UiSelect).props("items");

    expect(items.map(({ value }) => value)).toStrictEqual([PostSortType.Hot, PostSortType.New, PostSortType.Top]);
  });
});
