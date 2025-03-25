import { createContext } from "@@/server/trpc/context";
import { trpcRouter } from "@@/server/trpc/routers";
import { createTRPCNuxtHandler } from "trpc-nuxt";

export default createTRPCNuxtHandler({
  createContext,
  router: trpcRouter,
});
