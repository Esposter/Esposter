import type { AppRouter } from "@/server/trpc/routers";
import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";
import { createTRPCMsw } from "msw-trpc";
import SuperJSON from "superjson";

export const trpcMsw = createTRPCMsw<AppRouter>({
  basePath: TRPC_CLIENT_PATH,
  transformer: {
    input: SuperJSON,
    output: SuperJSON,
  },
});
