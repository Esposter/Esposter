import { TRPC_CLIENT_PATH } from "@@/app/services/trpc/constants";
import { env } from "cloudflare:workers";
import { defineEventHandler } from "nuxt/server";

// The instance Nitro's own Durable Object answers as, so a call here and a socket there reach the same in-memory state
const DURABLE_OBJECT_INSTANCE = "server";

// Every tRPC procedure, subscription and call map lives in the one Durable Object, so a call the Worker receives is
// Sent to it. A request the object itself is answering carries the object's state as its context, where the Worker's
// Request carries the execution context, which is how the two are told apart
export default defineEventHandler((event) => {
  if (!event.url.pathname.startsWith(`${TRPC_CLIENT_PATH}/`)) return;
  const context = event.req.runtime?.cloudflare?.context;
  if (context && "storage" in context) return;
  const { $DurableObject: durableObject } = env;
  return durableObject.get(durableObject.idFromName(DURABLE_OBJECT_INSTANCE)).fetch(event.req);
});
