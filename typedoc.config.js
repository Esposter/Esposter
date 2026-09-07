import { DOCS_API_DIRECTORY } from "@esposter/configuration";
import { config } from "dotenv";

config({ path: "apps/web/.env" });
/** @satisfies {import('typedoc').TypeDocOptions} */
const typedocConfiguration = {
  entryPoints: ["packages/*"],
  entryPointStrategy: "packages",
  exclude: ["apps/web", "packages/configuration"],
  name: "Esposter",
  out: `apps/web/public/${DOCS_API_DIRECTORY}`,
  packageOptions: {
    entryPoints: ["src/index.ts"],
    includeVersion: true,
  },
};

if (process.env.BASE_URL) {
  typedocConfiguration.hostedBaseUrl = `${process.env.BASE_URL}/${DOCS_API_DIRECTORY}`;
  typedocConfiguration.useHostedBaseUrlForAbsoluteLinks = true;
}

export default typedocConfiguration;
