import { alias } from "./configuration/alias";
import { app } from "./configuration/app";
import { authJs } from "./configuration/authJs";
import { build } from "./configuration/build";
import { experimental } from "./configuration/experimental";
import { fonts } from "./configuration/fonts";
import { imports } from "./configuration/imports";
import { modules } from "./configuration/modules";
import { pwa } from "./configuration/pwa";
import { runtimeConfig } from "./configuration/runtimeConfig";
import { security } from "./configuration/security";
import { typescript } from "./configuration/typescript";
import { unocss } from "./configuration/unocss";
import { vite } from "./configuration/vite";

export default defineNuxtConfig({
  alias,
  app,
  authJs,
  build,
  experimental,
  fonts,
  imports,
  modules,
  pwa,
  runtimeConfig,
  security,
  typescript,
  unocss,
  vite,
});
