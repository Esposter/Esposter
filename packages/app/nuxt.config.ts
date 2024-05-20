import { alias } from "./configuration/alias";
import { app } from "./configuration/app";
import { authJs } from "./configuration/authJs";
import { build } from "./configuration/build";
import { experimental } from "./configuration/experimental";
import { fonts } from "./configuration/fonts";
import { imports } from "./configuration/imports";
import { modules } from "./configuration/modules";
import { nitro } from "./configuration/nitro";
import { pwa } from "./configuration/pwa";
import { security } from "./configuration/security";
import { typescript } from "./configuration/typescript";
import { unocss } from "./configuration/unocss";
import { vite } from "./configuration/vite";
import "./env.client";
import "./env.server";
import "./env.shared";

export default defineNuxtConfig({
  alias,
  app,
  build,
  experimental,
  imports,
  nitro,
  typescript,
  vite,

  modules,
  authJs,
  fonts,
  pwa,
  security,
  unocss,
});
