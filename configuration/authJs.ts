import type { NuxtConfig } from "nuxt/schema";
import { env } from "../env.client";
import { RoutePath } from "../models/router/RoutePath";

export const authJs: NuxtConfig["authJs"] = {
  baseUrl: env.NUXT_PUBLIC_BASE_URL,
  guestRedirectTo: RoutePath.Login,
  authenticatedRedirectTo: RoutePath.Index,
};
