// @TODO: This should not be required once nuxt fixes its types
// oxlint-disable-next-line typescript/ban-ts-comment
// @ts-nocheck
import { app } from "./configuration/app";
import { build } from "./configuration/build";
import { compatibilityDate } from "./configuration/compatibilityDate";
import { content } from "./configuration/content";
import { css } from "./configuration/css";
import { devtools } from "./configuration/devtools";
import { experimental } from "./configuration/experimental";
import { future } from "./configuration/future";
import { hooks } from "./configuration/hooks";
import { image } from "./configuration/image";
import { imports } from "./configuration/imports";
import { modules } from "./configuration/modules";
import { nitro } from "./configuration/nitro";
import { ogImage } from "./configuration/ogImage";
import { pwa } from "./configuration/pwa";
import { routeRules } from "./configuration/routeRules";
import { runtimeConfig } from "./configuration/runtimeConfig";
import { security } from "./configuration/security";
import { site } from "./configuration/site";
import { vite } from "./configuration/vite";
import { vue } from "./configuration/vue";
import { vuetify } from "./configuration/vuetify";

export default defineNuxtConfig({
  app,
  build,
  compatibilityDate,
  content,
  css,
  devtools,
  experimental,
  future,
  hooks,
  image,
  imports,
  modules,
  nitro,
  ogImage,
  pwa,
  routeRules,
  runtimeConfig,
  security,
  site,
  vite,
  vue,
  vuetify,
});
