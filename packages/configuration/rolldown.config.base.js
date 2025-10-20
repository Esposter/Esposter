import { dts } from "rolldown-plugin-dts";
/** @satisfies {import('rolldown').RolldownOptions} */
export default {
  external: [
    // @esposter/db
    "@esposter/db-schema",
    // Most packages depend on @esposter/shared
    "@esposter/shared",
    // @esposter/db-schema
    "drizzle-orm",
    "drizzle-zod",
    "zod",
  ],
  input: "src/index.ts",
  output: { dir: "dist", format: "es" },
  plugins: [
    dts({
      resolve: [
        // azure-mock
        "@azure/core-http-compat",
        "@azure/core-rest-pipeline",
        "type-fest",
      ],
      tsconfig: "tsconfig.build.json",
    }),
  ],
  tsconfig: "tsconfig.build.json",
};
