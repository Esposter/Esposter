import type { NuxtConfig } from "nuxt/schema";

import { getCloudflareEnvironment } from "#configuration/wrangler";

import { HostedAssetOriginMap } from "../../../packages/db-schema/src/services/storage/HostedAssetOriginMap.ts";

// Only what the browser needs — everything under `public` is serialised into the client payload. Server code reads its
// Secrets straight off the environment under their own names, checked at startup by the environment plugin. These
// Values are read at build time, since a Worker's runtime config is the one its build wrote, so the deploy sets them in
// The build
export const runtimeConfig: NonNullable<NuxtConfig["runtimeConfig"]> = {
  public: {
    baseUrl: process.env.BASE_URL ?? "",
    // An unset value is the empty string, so the key is in place for the build to fill
    facebook: { clientId: process.env.FACEBOOK_CLIENT_ID ?? "" },
    // The origin the game's hosted objects are read from in this environment, which the engines and loaders fetch from
    hostedAssets: { baseUrl: HostedAssetOriginMap[getCloudflareEnvironment()] },
    publicAssets: { baseUrl: process.env.PUBLIC_ASSETS_BASE_URL ?? "" },
    vapid: { publicKey: process.env.VAPID_PUBLIC_KEY ?? "" },
  },
};
