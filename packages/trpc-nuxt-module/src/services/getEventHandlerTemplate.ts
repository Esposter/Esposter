import type { ExportReference } from "#src/models/ExportReference";

import { getImportStatement } from "#src/services/getImportStatement";

// Written out rather than built from the module name, so the subpath audit can see the module consume its arm.
export const getEventHandlerTemplate = (
  router: ExportReference,
  endpoint: string,
  createContext?: ExportReference,
): string =>
  [
    `import { createTRPCEventHandler } from "trpc-nuxt-module/runtime/server/createTRPCEventHandler";`,
    getImportStatement(router, "router"),
    ...(createContext ? [getImportStatement(createContext, "createContext")] : []),
    `export default createTRPCEventHandler({ ${createContext ? "createContext, " : ""}endpoint: ${JSON.stringify(endpoint)}, router });`,
  ].join("\n");
