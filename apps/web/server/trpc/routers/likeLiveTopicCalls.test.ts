import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createCallerFactory } from "#server/trpc/index";
import { trpcRouter } from "#server/trpc/routers/index";
import { postRouter } from "#server/trpc/routers/post";

const title = "title";
const value = 1;
const updatedValue = -1;

// The like router's cases for the app-wide live topic check: a vote moves its post's count, which the post and the feed
// Show, so each write creates, changes or removes the viewer's vote on a post
export const createLikeLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const newPost = await createCallerFactory(postRouter)(context).createPost({ title });
  return {
    queries: [],
    writes: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).like.createLike({ postId: newPost.id, value }),
        path: "like.createLike",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).like.updateLike({ postId: newPost.id, value: updatedValue }),
        path: "like.updateLike",
      },
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).like.deleteLike(newPost.id),
        path: "like.deleteLike",
      },
    ],
  };
};
