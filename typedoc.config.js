import { config } from "dotenv";

config({ path: "packages/app/.env" });
/** @type {Partial<import('typedoc').TypeDocOptions>} */
const typedocConfiguration = {
  entryPoints: ["packages/*"],
  name: "Documentation",
  entryPointStrategy: "packages",
  packageOptions: {
    entryPoints: ["src/index.ts"],
    includeVersion: true,
  },
  exclude: ["packages/app", "packages/configuration"],
  out: "packages/app/public/docs",
}

if (process.env.BASE_URL) {
  typedocConfiguration.hostedBaseUrl = `${process.env.BASE_URL}/docs`;
  typedocConfiguration.useHostedBaseUrlForAbsoluteLinks = true;
}

export default typedocConfiguration;
