import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { createTRPCNuxtProxyClient } from "trpc-nuxt/client";
import type { AppRouter } from "@/server/trpc/routers";

export default defineNuxtPlugin(() => {
  const url = useTRPCClientUrl();
  const client = createTRPCNuxtProxyClient<AppRouter>({ links: [httpBatchLink({ url })], transformer: superjson });
  return { provide: { client } };
});
