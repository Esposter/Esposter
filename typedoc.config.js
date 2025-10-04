import { externalSymbolLinkMappings as azureMockExternalSymbolLinkMappings } from "azure-mock";
import { config } from "dotenv";

import { externalSymbolLinkMappings as vuePhaserjsExternalSymbolLinkMappings } from "./packages/vue-phaserjs/typedoc/externalSymbolLinkMappings.js";

config({ path: "packages/app/.env" });
/** @satisfies {import('typedoc').TypeDocOptions} */
const typedocConfiguration = {
  entryPoints: ["packages/*"],
  entryPointStrategy: "packages",
  exclude: ["packages/app", "packages/configuration"],
  externalSymbolLinkMappings: {
    ...azureMockExternalSymbolLinkMappings,
    ...vuePhaserjsExternalSymbolLinkMappings,
  },
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
