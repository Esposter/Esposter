import { trpcMsw } from "@/test/mock/trpc";
import type { RequestHandler } from "msw";

export const postHandlers: RequestHandler[] = [
  trpcMsw.post.readPosts.query((_, res, ctx) => res(ctx.status(200), ctx.data({ posts: [], nextCursor: null }))),
];
