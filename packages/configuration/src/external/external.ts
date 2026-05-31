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
  "@rolldown/plugin-node-polyfills",
  "@vitejs/plugin-vue",
  "rolldown",
  "rolldown-plugin-dts",
  /^unplugin-auto-import/u,
  /^unplugin-dts/u,
  "vite",
  "vite-plugin-mkcert",
  "vitest/config",
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
  "@pulumi/pulumi",
  // @esposter/vue-phaserjs
  "phaser",
  /^phaser4-rex-plugins/u,
  ...externalVueFramework,
];
