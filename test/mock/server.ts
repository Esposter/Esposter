import type { AppRouter } from "@/server/trpc/routers";
import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";
import { createTRPCMsw } from "msw-trpc";
import { setupServer } from "msw/node";
import SuperJSON from "superjson";

const trpcMsw = createTRPCMsw<AppRouter>({
  basePath: TRPC_CLIENT_PATH,
  transformer: {
    input: SuperJSON,
    output: SuperJSON,
  },
});

export const server = setupServer(
  trpcMsw.post.readPosts.query((_, res, ctx) => res(ctx.status(200), ctx.data({ posts: [], nextCursor: null })))
);
