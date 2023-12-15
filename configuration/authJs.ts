import { type NuxtConfig } from "nuxt/schema";
import { RoutePath } from "../models/router/RoutePath";

export const authJs: NuxtConfig["authJs"] = {
  baseUrl: process.env.BASE_URL,
  guestRedirectTo: RoutePath.Login,
  authenticatedRedirectTo: RoutePath.Index,
};
