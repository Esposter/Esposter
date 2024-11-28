import { createContext } from "@@/server/trpc/context";
import { trpcRouter } from "@@/server/trpc/routers";
import { createNuxtApiHandler } from "trpc-nuxt";

export default createNuxtApiHandler({
  createContext,
  router: trpcRouter,
});
