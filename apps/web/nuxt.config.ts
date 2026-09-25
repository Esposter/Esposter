import { app } from "./configuration/app";
import { build } from "./configuration/build";
import { compatibilityDate } from "./configuration/compatibilityDate";
import { content } from "./configuration/content";
import { css } from "./configuration/css";
import { devtools } from "./configuration/devtools";
import { experimental } from "./configuration/experimental";
import { fonts } from "./configuration/fonts";
import { future } from "./configuration/future";
import { hooks } from "./configuration/hooks";
import { ignore } from "./configuration/ignore";
import { image } from "./configuration/image";
import { imports } from "./configuration/imports";
import { modules } from "./configuration/modules";
import { nitro } from "./configuration/nitro";
import { ogImage } from "./configuration/ogImage";
import { pwa } from "./configuration/pwa";
import { router } from "./configuration/router";
import { routeRules } from "./configuration/routeRules";
import { runtimeConfig } from "./configuration/runtimeConfig";
import { security } from "./configuration/security";
import { site } from "./configuration/site";
import { typescript } from "./configuration/typescript";
import { vite } from "./configuration/vite";

export default defineNuxtConfig({
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
