import type { NuxtConfig } from "nuxt/schema";

import { ImageSourceWhitelist } from "../shared/services/app/ImageSourceWhitelist";

export const routeRules: NuxtConfig["routeRules"] = {
  "/messages/**": {
    security: {
      headers: {
        contentSecurityPolicy: {
          "img-src": [...ImageSourceWhitelist, "https:"],
        },
      },
    },
  },
};
