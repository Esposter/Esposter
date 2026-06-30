import { config } from "dotenv";

import azureMockExternalSymbolLinkMappings from "./packages/azure-mock/typedoc/externalSymbolLinkMappings.js";
import vuePhaserjsExternalSymbolLinkMappings from "./packages/vue-phaserjs/typedoc/externalSymbolLinkMappings.js";

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
    // Packages mode runs validation per-package conversion, so this must live here (not at the root, where it
    // Applies only to the merged project) to suppress the ProcessProperties → NodeJS.ProcessEnv reference.
    intentionallyNotExported: ["NodeJS.ProcessEnv"],
  },
};

if (process.env.BASE_URL) {
  typedocConfiguration.hostedBaseUrl = `${process.env.BASE_URL}/docs`;
  typedocConfiguration.useHostedBaseUrlForAbsoluteLinks = true;
}

export default typedocConfiguration;
