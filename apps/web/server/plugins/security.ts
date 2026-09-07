import { ImageSourceWhitelist } from "#shared/services/app/ImageSourceWhitelist";
import { RoutePath } from "@esposter/shared";
import { defu } from "defu";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("nuxt-security:routeRules", (routeRules) => {
    routeRules[RoutePath.Messages("**")] = defu(
      {
        headers: {
          contentSecurityPolicy: {
            "img-src": [...ImageSourceWhitelist, "https:"],
          },
        },
      },
      routeRules[RoutePath.Messages("**")],
    );
  });
});
