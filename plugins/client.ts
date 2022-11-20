import type { AppRouter } from "@/server/trpc/routers";
import { isServer } from "@/util/constants.common";
import type { TRPCLink } from "@trpc/client";
import { createTRPCProxyClient, createWSClient, httpBatchLink, wsLink } from "@trpc/client";
import superjson from "superjson";

export default defineNuxtPlugin(() => {
  const url = useTRPCClientUrl();
  const links: TRPCLink<AppRouter>[] = [httpBatchLink({ url })];

  if (!isServer()) {
    const config = useRuntimeConfig();
    const wsClient = createWSClient({ url: `${config.public.wsBaseUrl}:${config.public.wsPort}` });
    links.push(wsLink({ client: wsClient }));
  }

  const client = createTRPCProxyClient<AppRouter>({ links, transformer: superjson });
  return { provide: { client } };
});
