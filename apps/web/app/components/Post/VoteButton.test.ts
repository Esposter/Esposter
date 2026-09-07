// @vitest-environment nuxt
import type { Like } from "@esposter/db-schema";

import PostVoteButton from "@/components/Post/VoteButton.vue";
import { createPost } from "@/services/post/createPost.test";
import { useLikeStore } from "@/store/post/like";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

const createViewerLike = (value: Like["value"]) => ({ value }) as Like;

// One button serves both directions, so the branch that decides between casting, switching and withdrawing
// A vote is written once — and a wrong branch here fires a create against the likes primary key
describe("postVoteButton", () => {
  // The store outlives the test, so a spy left on it collects the next case's clicks too
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test.each([
    { expectedAction: "createLike", value: 1 as const, viewerLike: undefined },
    { expectedAction: "createLike", value: -1 as const, viewerLike: undefined },
    { expectedAction: "deleteLike", value: 1 as const, viewerLike: createViewerLike(1) },
    { expectedAction: "deleteLike", value: -1 as const, viewerLike: createViewerLike(-1) },
    { expectedAction: "updateLike", value: 1 as const, viewerLike: createViewerLike(-1) },
    { expectedAction: "updateLike", value: -1 as const, viewerLike: createViewerLike(1) },
  ])("$expectedAction on a $value vote over $viewerLike", async ({ expectedAction, value, viewerLike }) => {
    expect.hasAssertions();

    const likeStore = useLikeStore();
    const createLike = vi.spyOn(likeStore, "createLike").mockResolvedValue();
    const deleteLike = vi.spyOn(likeStore, "deleteLike").mockResolvedValue();
    const updateLike = vi.spyOn(likeStore, "updateLike").mockResolvedValue();
    const post = createPost({ viewerLike });
    const component = await mountSuspended(PostVoteButton, { props: { post, value } });
    await component.find("button").trigger("click");

    expect({
      createLike: createLike.mock.calls,
      deleteLike: deleteLike.mock.calls,
      updateLike: updateLike.mock.calls,
    }).toStrictEqual({
      createLike: expectedAction === "createLike" ? [[{ postId: post.id, value }]] : [],
      deleteLike: expectedAction === "deleteLike" ? [[post.id]] : [],
      updateLike: expectedAction === "updateLike" ? [[{ postId: post.id, value }]] : [],
    });
  });
});
