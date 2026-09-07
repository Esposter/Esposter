import type { NuxtConfig } from "nuxt/schema";

import { SITE_DESCRIPTION, SITE_NAME } from "../shared/services/app/constants";

// The one hostname nuxt-site-config refuses as a site url, and the one BASE_URL always carries locally
const LOCALHOST_HOSTNAME = "localhost";
const baseUrl = process.env.BASE_URL ?? "";
// Only a canonical public origin belongs here, and locally there is none — the module resolves the origin from
// The request instead, so an empty url costs nothing (its config stack drops "" exactly like an absent key).
// Handing it localhost is what its validator rejects, and it rejects for anything that is not `nuxt dev` —
// Typecheck, build and prepare all count — so a local .env warns on every one of them
export const site: NuxtConfig["site"] = {
  description: SITE_DESCRIPTION,
  name: SITE_NAME,
  url: URL.parse(baseUrl)?.hostname === LOCALHOST_HOSTNAME ? "" : baseUrl,
};
