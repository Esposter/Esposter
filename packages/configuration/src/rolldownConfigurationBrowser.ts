import type { RolldownOptions } from "rolldown";

import { dts } from "rolldown-plugin-dts";

export const rolldownConfigurationBrowser: RolldownOptions = {
  external: [
    // All workspace packages — regex covers @esposter/shared, @esposter/db-schema,
    // @esposter/xml2js, @esposter/parse-tmx, etc. so new packages are external automatically
    /@esposter\//u,
    // @esposter/db
    "@azure/data-tables",
    "@azure/search-documents",
    "@azure/storage-blob",
    "@azure/web-pubsub",
    // @esposter/infra
    "@pulumi/azure-native",
    "@pulumi/pulumi",
    // @esposter/db-schema
    "zod",
    // @esposter/db-mock
    /^drizzle-kit/u,
    /^drizzle-orm/u,
    "@electric-sql/pglite",
  ],
  input: "src/index.ts",
  output: { dir: "dist", format: "es" },
  // @TODO: https://github.com/qmhc/unplugin-dts/issues/458
  plugins: [dts({ tsconfig: "tsconfig.build.json" })],
  tsconfig: "tsconfig.build.json",
};
