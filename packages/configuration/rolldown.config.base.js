import { dts } from "rolldown-plugin-dts";
/** @satisfies {import('rolldown').RolldownOptions} */
const rolldownOptions = {
  external: [
    // @esposter/db
    "@azure/data-tables",
    "@azure/storage-blob",
    "@azure/web-pubsub",
    "@esposter/db-schema",
    // Most packages depend on @esposter/shared
    "@esposter/shared",
    // @esposter/db-schema
    "drizzle-orm",
    "drizzle-orm/pg-core",
    // @esposter/db
    "drizzle-orm/postgres-js",
    "drizzle-orm/zod",
    "zod",
  ],
  input: "src/index.ts",
  output: { dir: "dist", format: "es" },
  plugins: [dts({ tsconfig: "tsconfig.build.json" })],
  tsconfig: "tsconfig.build.json",
};

export default rolldownOptions;
