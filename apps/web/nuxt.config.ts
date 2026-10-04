import { app } from "./configuration/app.ts";
import { build } from "./configuration/build.ts";
import { compatibilityDate } from "./configuration/compatibilityDate.ts";
import { content } from "./configuration/content.ts";
import { css } from "./configuration/css.ts";
import { development } from "./configuration/development.ts";
import { devtools } from "./configuration/devtools.ts";
import { experimental } from "./configuration/experimental.ts";
import { fonts } from "./configuration/fonts.ts";
import { future } from "./configuration/future.ts";
import { hooks } from "./configuration/hooks.ts";
import { ignore } from "./configuration/ignore.ts";
import { image } from "./configuration/image.ts";
import { imports } from "./configuration/imports.ts";
import { modules } from "./configuration/modules.ts";
import { nitro } from "./configuration/nitro.ts";
import { ogImage } from "./configuration/ogImage.ts";
import { pwa } from "./configuration/pwa.ts";
import { router } from "./configuration/router.ts";
import { routeRules } from "./configuration/routeRules.ts";
import { runtimeConfig } from "./configuration/runtimeConfig.ts";
import { security } from "./configuration/security.ts";
import { site } from "./configuration/site.ts";
import { typescript } from "./configuration/typescript.ts";
import { vite } from "./configuration/vite.ts";

export default defineNuxtConfig({
  $development: development,
  app,
  build,
  compatibilityDate,
  content,
  css,
  devtools,
  experimental,
  fonts,
  future,
  hooks,
  ignore,
  image,
  imports,
  modules,
  nitro,
  ogImage,
  pwa,
  router,
  routeRules,
  runtimeConfig,
  security,
  site,
  typescript,
  vite,
});
