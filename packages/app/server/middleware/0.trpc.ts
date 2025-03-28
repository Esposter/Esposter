import { TRPC_CLIENT_PATH } from "@/services/trpc/constants";
import { createContext } from "@@/server/trpc/context";
import { trpcRouter } from "@@/server/trpc/routers";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
// @TODO: https://github.com/wobsoriano/trpc-nuxt/issues/215
export default defineEventHandler(async (event) => {
  if (event.path.startsWith(TRPC_CLIENT_PATH))
    return fetchRequestHandler({
      createContext: () => createContext(event),
      endpoint: TRPC_CLIENT_PATH,
      req: toWebRequest(event),
      router: trpcRouter,
    });
});
