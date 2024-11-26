import type { NuxtConfig } from "nuxt/schema";

import { SITE_DESCRIPTION, SITE_NAME } from "../shared/services/esposter/constants";

export const site: NuxtConfig["site"] = {
  description: SITE_DESCRIPTION,
  name: SITE_NAME,
  url: process.env.BASE_URL,
};
