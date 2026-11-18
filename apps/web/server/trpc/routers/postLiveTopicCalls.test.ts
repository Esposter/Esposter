import { trpcRouter } from "#server/trpc/routers/index";
import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { createCallerFactory } from "#server/trpc/index";
import { postRouter } from "#server/trpc/routers/post";
import { v7 } from "uuid";

const title = "title";
const updatedTitle = "updatedTitle";
const description = "description";
const updatedDescription = "updatedDescription";

// The post router's cases for the app-wide live topic check: the post, its counts and the feed read them, and the writes
// Create, edit and delete posts and comments, each of which changes one of those reads
export const createPostLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  const postCaller = createCallerFactory(postRouter)(context);
  const newPost = await postCaller.createPost({ title });
  const { comment: newComment } = await postCaller.createComment({ description, id: v7(), parentId: newPost.id });
  const removedPost = await postCaller.createPost({ title });

  return {
    queries: [
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).post.readPost(newPost.id),
        path: "post.readPost",
      },
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).post.readPostCounts([newPost.id]),
        path: "post.readPostCounts",
      },
      { call: (callContext) => createCallerFactory(trpcRouter)(callContext).post.readPosts(), path: "post.readPosts" },
    ],
    writes: [
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).post.createComment({
            description,
            id: v7(),
            parentId: newPost.id,
          }),
        path: "post.createComment",
      },
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).post.createPost({ title }),
        path: "post.createPost",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).post.updateComment({
            description: updatedDescription,
            id: newComment.id,
          }),
        path: "post.updateComment",
      },
      {
        call: (callContext) =>
          createCallerFactory(trpcRouter)(callContext).post.updatePost({ id: newPost.id, title: updatedTitle }),
        path: "post.updatePost",
      },
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).post.deleteComment(newComment.id),
        path: "post.deleteComment",
      },
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).post.deletePost(removedPost.id),
        path: "post.deletePost",
      },
    ],
  };
};
