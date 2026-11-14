import type { NuxtConfig } from "nuxt/schema";

// Only what the browser needs — everything under `public` is serialised into the client payload. Server code reads its
// Secrets straight off the environment under their own names, checked at startup by the environment plugin. These values
// are read at build time, since a Worker's runtime config is the one its build wrote, so the deploy sets them in the build
export const runtimeConfig: NuxtConfig["runtimeConfig"] = {
  public: {
    baseUrl: process.env.BASE_URL,
    facebook: { clientId: process.env.FACEBOOK_CLIENT_ID },
    publicAssets: { baseUrl: process.env.PUBLIC_ASSETS_BASE_URL },
    vapid: { publicKey: process.env.VAPID_PUBLIC_KEY },
  },
};
