import { alias } from "./configuration/alias";
import { app } from "./configuration/app";
import { authJs } from "./configuration/authJs";
import { build } from "./configuration/build";
import { experimental } from "./configuration/experimental";
import { imports } from "./configuration/imports";
import { modules } from "./configuration/modules";
import { nitro } from "./configuration/nitro";
import { pwa } from "./configuration/pwa";
import { runtimeConfig } from "./configuration/runtimeConfig";
import { typescript } from "./configuration/typescript";
import { unfonts } from "./configuration/unfonts";
import { unocss } from "./configuration/unocss";
import { vite } from "./configuration/vite";

export default defineNuxtConfig({
  alias,
  app,
  build,
  experimental,
  imports,
  nitro,
  runtimeConfig,
  typescript,
  vite,

  modules,
  authJs,
  pwa,
  unfonts,
  unocss,
});
