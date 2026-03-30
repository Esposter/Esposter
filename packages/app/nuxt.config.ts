// @TODO: This should not be required once nuxt fixes its types
// oxlint-disable-next-line ban-ts-comment
// @ts-nocheck
import { app } from "./configuration/app";
import { build } from "./configuration/build";
import { compatibilityDate } from "./configuration/compatibilityDate";
import { css } from "./configuration/css";
import { devtools } from "./configuration/devtools";
import { experimental } from "./configuration/experimental";
import { imports } from "./configuration/imports";
import { modules } from "./configuration/modules";
import { nitro } from "./configuration/nitro";
import { pwa } from "./configuration/pwa";
import { runtimeConfig } from "./configuration/runtimeConfig";
import { security } from "./configuration/security";
import { site } from "./configuration/site";
import { typescript } from "./configuration/typescript";
import { unocss } from "./configuration/unocss";
import { vite } from "./configuration/vite";
import { vuetify } from "./configuration/vuetify";

export default defineNuxtConfig({
  app,
  build,
  compatibilityDate,
  css,
  devtools,
  experimental,
  imports,
  modules,
  nitro,
  pwa,
  runtimeConfig,
  security,
  site,
  typescript,
  unocss,
  vite,
  vuetify,
});
