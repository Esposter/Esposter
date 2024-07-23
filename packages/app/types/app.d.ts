import type { Client } from "@/plugins/client";
// @TODO: https://github.com/wobsoriano/trpc-nuxt/issues/91
declare module "#app" {
  interface NuxtApp {
    $client: Client;
  }
}
