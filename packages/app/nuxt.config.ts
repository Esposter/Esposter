import { alias } from "./configuration/alias";
import { app } from "./configuration/app";
import { authJs } from "./configuration/authJs";
import { build } from "./configuration/build";
import { compatibilityDate } from "./configuration/compatibilityDate";
import { experimental } from "./configuration/experimental";
import { future } from "./configuration/future";
import { imports } from "./configuration/imports";
import { modules } from "./configuration/modules";
import { pwa } from "./configuration/pwa";
import { runtimeConfig } from "./configuration/runtimeConfig";
import { security } from "./configuration/security";
import { site } from "./configuration/site";
import { typescript } from "./configuration/typescript";
import { unocss } from "./configuration/unocss";
import { vite } from "./configuration/vite";

export default defineNuxtConfig({
  alias,
  app,
  authJs,
  build,
  compatibilityDate,
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
});
