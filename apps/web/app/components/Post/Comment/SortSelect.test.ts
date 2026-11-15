// @vitest-environment nuxt
import { PostSortType } from "#shared/models/post/PostSortType";
import PostCommentSortSelect from "@/components/Post/Comment/SortSelect.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("postCommentSortSelect", () => {
  test("comment sort lists Hot, Top, New and Old", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PostCommentSortSelect);

    expect(
      component
        .findComponent({ name: "UiSelect" })
        .props("items")
        .map(({ value }: { value: PostSortType }) => value),
    ).toStrictEqual([PostSortType.Hot, PostSortType.Top, PostSortType.New, PostSortType.Old]);
  });
});
