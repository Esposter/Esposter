// @vitest-environment nuxt
import PostCommentSortSelect from "@/components/Post/Comment/SortSelect.vue";
import UiSelect from "@/components/Ui/Select/Index.vue";
import { PostSortType } from "@/models/post/PostSortType";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("postCommentSortSelect", () => {
  test("Comment sort lists Hot, Top, New and Old", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PostCommentSortSelect);

    expect(component.findComponent(UiSelect).vm.$props).toMatchObject({
      items: [
        { value: PostSortType.Hot },
        { value: PostSortType.Top },
        { value: PostSortType.New },
        { value: PostSortType.Old },
      ],
    });
  });
});
