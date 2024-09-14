import { config } from "dotenv";

config({ path: "packages/app/.env" });

/** @type {Partial<import('typedoc').TypeDocOptions>} */
export default {
  entryPoints: ["packages/*"],
  name: "Documentation",
  entryPointStrategy: "packages",
  packageOptions: {
    entryPoints: ["src/index.ts"],
    includeVersion: true,
  },
  exclude: ["packages/app", "packages/configuration"],
  hostedBaseUrl: `${process.env.BASE_URL}/docs`,
  useHostedBaseUrlForAbsoluteLinks: true,
  out: "packages/app/public/docs",
};
