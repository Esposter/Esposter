// @vitest-environment nuxt
import { PostSortType } from "#shared/models/post/PostSortType";
import PostList from "#src/components/Post/List.vue";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { createEmptyPage } from "@esposter/db-schema";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("postList", () => {
  const { trpcMsw } = setupMswTrpc();

  test("feed Sort by omits Old", async () => {
    expect.hasAssertions();

    trpcMsw.post.readPosts.query(() => createEmptyPage());
    const component = await mountSuspended(PostList);

    expect(
      component
        .findComponent({ name: "UiSelect" })
        .props("items")
        .map(({ value }: { value: PostSortType }) => value),
    ).toStrictEqual([PostSortType.Hot, PostSortType.New, PostSortType.Top]);
  });
});
