import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@/server/trpc/routers";

export default defineNuxtPlugin(() => {
  const url = useTRPCClientUrl();
  const client = createTRPCProxyClient<AppRouter>({ links: [httpBatchLink({ url })], transformer: superjson });
  return { provide: { client } };
});
