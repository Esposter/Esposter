import { ImageSourceWhitelist } from "#shared/services/app/ImageSourceWhitelist";
import { RoutePath } from "@esposter/shared";
import { defu } from "defu";
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("nuxt-security:routeRules", (routeRules) => {
    routeRules[RoutePath.Messages("**")] = defu(
      { headers: { contentSecurityPolicy: { "img-src": [...ImageSourceWhitelist, "https:"] } } },
      routeRules[RoutePath.Messages("**")],
    );
    // The door opens onto a YouTube embed, whose player a page with an embedder policy can only frame credentialless,
    // Where it loses the autoplay with sound the door's click gave it; the page shares no memory, so it needs none
    routeRules[RoutePath.Genshin] = defu(
      { headers: { crossOriginEmbedderPolicy: "unsafe-none" } },
      routeRules[RoutePath.Genshin],
    );
  });
});
