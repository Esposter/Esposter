import type { RolldownOptions } from "rolldown";

import { dts } from "rolldown-plugin-dts";

export const rolldownConfigurationBrowser: RolldownOptions = {
  external: [
    // @esposter/db
    "@azure/data-tables",
    "@azure/search-documents",
    "@azure/storage-blob",
    "@azure/web-pubsub",
    "@esposter/db-schema",
    // Most packages depend on @esposter/shared
    "@esposter/shared",
    // @esposter/db-schema
    "drizzle-zod",
    "zod",
    // @esposter/db-mock
    /^drizzle-kit/,
    /^drizzle-orm/,
    "@electric-sql/pglite",
  ],
  input: "src/index.ts",
  output: { dir: "dist", format: "es" },
  // @TODO: https://github.com/qmhc/unplugin-dts/issues/458
  plugins: [dts({ tsconfig: "tsconfig.build.json" })],
  tsconfig: "tsconfig.build.json",
};
