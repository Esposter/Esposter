import type { ExportReference } from "#src/models/ExportReference";

import { MODULE_NAME } from "#src/runtime/constants";
import { getImportStatement } from "#src/services/getImportStatement";

export const getEventHandlerTemplate = (
  router: ExportReference,
  endpoint: string,
  createContext?: ExportReference,
): string =>
  [
    `import { createTRPCEventHandler } from "${MODULE_NAME}/runtime/server/createTRPCEventHandler";`,
    getImportStatement(router, "router"),
    ...(createContext ? [getImportStatement(createContext, "createContext")] : []),
    `export default createTRPCEventHandler({ ${createContext ? "createContext, " : ""}endpoint: ${JSON.stringify(endpoint)}, router });`,
  ].join("\n");
