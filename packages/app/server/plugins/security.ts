import { RoutePath } from "#shared/models/router/RoutePath";
import { ImageSourceWhitelist } from "@@/server/services/esposter/ImageSourceWhitelist";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("nuxt-security:routeRules", (routeRules) => {
    routeRules[RoutePath.Messages("**")] = defuReplaceArray(
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
