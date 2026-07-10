import type { NitroConfig } from "nitropack/types";

import { RoutePath } from "@esposter/shared";

export const routeRules: NitroConfig["routeRules"] = {
  // The resource explorer is an authenticated SPA area (no SSR/SEO benefit) that touches localStorage/window, so render every resource page client-only.
  [`${RoutePath.Resources}/**`]: { ssr: false },
};
