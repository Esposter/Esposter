import { httpBatchLink } from "@trpc/client";
import { createTRPCNuxtProxyClient } from "trpc-nuxt/client";
import type { AppRouter } from "@/server/trpc/routers";

export default defineNuxtPlugin(() => {
  const url = useTRPCClientUrl();
  const client = createTRPCNuxtProxyClient<AppRouter>({ links: [httpBatchLink({ url })] });
  return { provide: { client } };
});
