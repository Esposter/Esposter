import "nitropack/types";
import type { NuxtConfig } from "nuxt/schema";

declare module "nitropack/types" {
  interface NitroRouteConfig {
    security: NuxtConfig["security"];
  }
}
