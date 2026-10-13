import { ImageSourceWhitelist } from "#shared/services/app/ImageSourceWhitelist";
import { RoutePath } from "@esposter/shared";
import { defu } from "defu";
import { definePlugin } from "nitro";

// Where members author content for each other — a message, a resource's page or email — an image is a link to
// Anywhere on the web, which no allowlist can enumerate
const userContentRoutes = [RoutePath.Messages("**"), RoutePath.Resource("**")];

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("nuxt-security-module:routeRules", (routeRules) => {
    for (const route of userContentRoutes)
      routeRules[route] = defu(
        { headers: { contentSecurityPolicy: { "img-src": [...ImageSourceWhitelist, "https:"] } } },
        routeRules[route],
      );
  });
});
