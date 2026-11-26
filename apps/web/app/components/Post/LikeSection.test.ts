// @vitest-environment nuxt
import PostLikeSection from "#src/components/Post/LikeSection.vue";
import { createPost } from "#src/services/post/createPost.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("postLikeSection", () => {
  // The default session is a guest's, so no sign-in is set up here
  test("a guest sees both vote buttons", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PostLikeSection, { props: { post: createPost() } });

    expect(component.findAll("button")).toHaveLength(2);
  });
});
