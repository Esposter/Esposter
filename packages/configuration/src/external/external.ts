import { externalVueFramework } from "./externalVueFramework";

export const external: (RegExp | string)[] = [
  // Workspace packages — never bundle sibling packages
  /@esposter\//u,
  "azure-mock",
  "parse-tmx",
  "vue-phaserjs",
  // @esposter/azure-mock
  "@azure/core-http-compat",
  "@azure/core-rest-pipeline",
  "@azure/eventgrid",
  "@azure/storage-queue",
  // @esposter/configuration
  // GetBenchmarkPlugins imports codspeedPlugin: must stay external (never bundle) because the plugin loads
  // Sibling runtime files (globalSetup, the mode runners) and its native prebuilds via __dirname — inlining
  // Breaks those paths. As an externalized import it is a `peerDependency` of this package (external imports
  // Are peers, never deps/devDeps); only invoked when CODSPEED_ENV is set (CI).
  /^@codspeed\//u,
  "@rolldown/plugin-node-polyfills",
  "@vitejs/plugin-vue",
  "rolldown",
  "rolldown-plugin-dts",
  /^unplugin-auto-import/u,
  /^unplugin-dts/u,
  "vite",
  "vite-plugin-mkcert",
  // Covers vitest, vitest/config, vitest/node — the reporter imports vitest/node; never bundle the runner
  /^vitest(?:\/|$)/u,
  // @esposter/db
  "@azure/core-client",
  "@azure/data-tables",
  "@azure/search-documents",
  "@azure/storage-blob",
  "@azure/web-pubsub",
  // @esposter/db-mock
  "@electric-sql/pglite",
  /^drizzle-kit/u,
  // @esposter/db-schema
  /^drizzle-orm/u,
  "zod",
  // @esposter/infra
  "@pulumi/azure-native",
  "@pulumi/github",
  "@pulumi/pulumi",
  // @esposter/vue-phaserjs
  "phaser",
  /^phaser4-rex-plugins/u,
  ...externalVueFramework,
];
