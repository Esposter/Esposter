import { serverFetch } from "nitro/app";
import { defineNuxtPlugin } from "nuxt/app";

// Server only, so the client bundle never loads Nitro's app: the in-process fetch a server-rendered tRPC call falls back
// To when its request event has no app to answer it
const trpcServerFetchPlugin: ReturnType<typeof defineNuxtPlugin> = defineNuxtPlugin(() => ({
  provide: { trpcServerFetch: serverFetch },
}));

export default trpcServerFetchPlugin;
