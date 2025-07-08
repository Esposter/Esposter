import type { ModuleOptions } from "nuxt-site-config";

import { SITE_DESCRIPTION, SITE_NAME } from "../shared/services/esposter/constants";

export const site: Partial<ModuleOptions> = {
  description: SITE_DESCRIPTION,
  name: SITE_NAME,
  url: process.env.BASE_URL,
};
