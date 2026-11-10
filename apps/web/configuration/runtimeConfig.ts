import type { NuxtConfig } from "nuxt/schema";

// Only what the browser needs — everything under `public` is serialised into the client payload. Server code reads its
// Secrets straight off the environment under their own names, checked at startup by the environment plugin
export const runtimeConfig: NuxtConfig["runtimeConfig"] = {
  public: {
    azure: { container: { baseUrl: process.env.AZURE_CONTAINER_BASE_URL } },
    baseUrl: process.env.BASE_URL,
    facebook: { clientId: process.env.FACEBOOK_CLIENT_ID },
    vapid: { publicKey: process.env.VAPID_PUBLIC_KEY },
  },
};
