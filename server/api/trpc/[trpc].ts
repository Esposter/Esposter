import { createContext } from "@/server/trpc/context";
import { appRouter } from "@/server/trpc/routers";
import { createNuxtApiHandler } from "trpc-nuxt";

export default createNuxtApiHandler({
  router: appRouter,
  createContext,
});
