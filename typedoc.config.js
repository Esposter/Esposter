import { config } from "dotenv";

config({ path: "packages/app/.env" });
/** @satisfies {import('typedoc').TypeDocOptions} */
const typedocConfiguration = {
  entryPoints: ["packages/*"],
  name: "Esposter",
  entryPointStrategy: "packages",
  packageOptions: {
    entryPoints: ["src/index.ts"],
    includeVersion: true,
  },
  exclude: ["packages/app", "packages/configuration"],
  out: "packages/app/public/docs",
};

if (process.env.BASE_URL) {
  typedocConfiguration.hostedBaseUrl = `${process.env.BASE_URL}/docs`;
  typedocConfiguration.useHostedBaseUrlForAbsoluteLinks = true;
}

export default typedocConfiguration;
