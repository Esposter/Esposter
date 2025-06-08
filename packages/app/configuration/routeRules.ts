import type { NuxtConfig } from "nuxt/schema";

import { RoutePath } from "../shared/models/router/RoutePath";
import { ImageSourceWhitelist } from "./security";

export const routeRules: NuxtConfig["routeRules"] = {
  [RoutePath.Messages("**")]: {
    security: {
      headers: {
        contentSecurityPolicy: {
          "img-src": [...ImageSourceWhitelist, "https:"],
        },
      },
    },
  },
};
