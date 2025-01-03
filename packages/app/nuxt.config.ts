import { app } from "./configuration/app";
import { build } from "./configuration/build";
import { compatibilityDate } from "./configuration/compatibilityDate";
import { experimental } from "./configuration/experimental";
import { future } from "./configuration/future";
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

export default defineNuxtConfig({
  app,
  build,
  compatibilityDate,
  experimental,
  future,
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
});
