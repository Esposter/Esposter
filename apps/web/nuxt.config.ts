import { app } from "#configuration/app";
import { build } from "#configuration/build";
import { compatibilityDate } from "#configuration/compatibilityDate";
import { css } from "#configuration/css";
import { devtools } from "#configuration/devtools";
import { experimental } from "#configuration/experimental";
import { fonts } from "#configuration/fonts";
import { ignore } from "#configuration/ignore";
import { image } from "#configuration/image";
import { imports } from "#configuration/imports";
import { modules } from "#configuration/modules";
import { nitro } from "#configuration/nitro";
import { ogImage } from "#configuration/ogImage";
import { pwa } from "#configuration/pwa";
import { router } from "#configuration/router";
import { routeRules } from "#configuration/routeRules";
import { runtimeConfig } from "#configuration/runtimeConfig";
import { security } from "#configuration/security";
import { site } from "#configuration/site";
import { skewProtection } from "#configuration/skewProtection";
import { typescript, typescriptHooks } from "#configuration/typescript";
import { vite, viteHooks } from "#configuration/vite";

export default defineNuxtConfig({
  app,
  build,
  compatibilityDate,
  css,
  devtools,
  experimental,
  fonts,
  hooks: { ...typescriptHooks, ...viteHooks },
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
  skewProtection,
  typescript,
  vite,
});
