import { createContext } from "@/server/trpc/context";
import { TRPCRouter } from "@/server/trpc/routers";
import { createNuxtApiHandler } from "trpc-nuxt";

export default createNuxtApiHandler({
  createContext,
  router: TRPCRouter,
});
