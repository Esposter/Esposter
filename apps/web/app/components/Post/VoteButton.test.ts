// @vitest-environment nuxt
import PostVoteButton from "@/components/Post/VoteButton.vue";
import { createPost } from "@/services/post/createPost.test";
import { useLikeStore } from "@/store/post/like";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

// Which write a press sends is decided by the like store's vote, which is tested there; the button's job is to hand
// It the post and the value it was rendered for
describe("postVoteButton", () => {
  // The store outlives the test, so a spy left on it collects the next case's clicks too
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("hands its post and value to the store's vote on a press", async () => {
    expect.hasAssertions();

    const likeStore = useLikeStore();
    const vote = vi.spyOn(likeStore, "vote").mockResolvedValue();
    const post = createPost();
    const component = await mountSuspended(PostVoteButton, { props: { post, value: 1 } });
    await component.find("button").trigger("click");

    expect(vote.mock.calls).toStrictEqual([[post, 1]]);
  });
});
