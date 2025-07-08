import { app } from "./app/configuration/app";
import { build } from "./app/configuration/build";
import { compatibilityDate } from "./app/configuration/compatibilityDate";
import { css } from "./app/configuration/css";
import { devtools } from "./app/configuration/devtools";
import { experimental } from "./app/configuration/experimental";
import { future } from "./app/configuration/future";
import { imports } from "./app/configuration/imports";
import { modules } from "./app/configuration/modules";
import { pwa } from "./app/configuration/pwa";
import { runtimeConfig } from "./app/configuration/runtimeConfig";
import { security } from "./app/configuration/security";
import { site } from "./app/configuration/site";
import { typescript } from "./app/configuration/typescript";
import { unocss } from "./app/configuration/unocss";
import { vite } from "./app/configuration/vite";
import { vuetify } from "./app/configuration/vuetify";

export default defineNuxtConfig({
  app,
  build,
  compatibilityDate,
  css,
  devtools,
  experimental,
  future,
  imports,
  modules,
  pwa,
  runtimeConfig,
  security,
  site,
  typescript,
  unocss,
  vite,
  vuetify,
});
