import type { NuxtConfig } from "nuxt/schema";

import { RoutePath } from "../shared/models/router/RoutePath";

export const authJs: NuxtConfig["authJs"] = {
  authenticatedRedirectTo: RoutePath.Index,
  baseUrl: process.env.BASE_URL,
  guestRedirectTo: RoutePath.Login,
};
