import { createNuxtApiHandler } from "trpc-nuxt";
import { appRouter } from "@/server/trpc/routers";

export default createNuxtApiHandler({
  router: appRouter,
  createContext: ({ req, res }) => ({ req, res }),
});
