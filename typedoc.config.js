import { config } from "dotenv";

config({ path: "packages/app/.env" });
/** @satisfies {import('typedoc').TypeDocOptions} */
const typedocConfiguration = {
  entryPoints: ["packages/*"],
  entryPointStrategy: "packages",
  exclude: ["packages/app", "packages/configuration"],
  name: "Esposter",
  out: "packages/app/public/docs",
  packageOptions: {
    entryPoints: ["src/index.ts"],
    includeVersion: true,
  },
};

if (process.env.BASE_URL) {
  typedocConfiguration.hostedBaseUrl = `${process.env.BASE_URL}/docs`;
  typedocConfiguration.useHostedBaseUrlForAbsoluteLinks = true;
}

export default typedocConfiguration;
