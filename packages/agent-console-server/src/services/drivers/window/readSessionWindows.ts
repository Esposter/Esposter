import type { SessionWindows } from "#src/models/window/SessionWindows";

import { sessionWindowsSchema } from "#src/models/window/SessionWindows";
import { SESSION_WINDOWS_FILENAME } from "#src/services/drivers/window/constants";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The windows the last host left open, or none when it left no file or one that cannot be read: a window that finds
// Nothing here cannot rejoin, and a host that finds nothing takes no window back
export const readSessionWindows = (stateDirectory: string): SessionWindows =>
  getResult(
    // oxlint-disable-next-line no-restricted-properties -- the schema validates the file, the pair /docs/architecture/serialization.md names
    () => sessionWindowsSchema.parse(JSON.parse(readFileSync(join(stateDirectory, SESSION_WINDOWS_FILENAME), "utf8"))),
  ).unwrapOr({ port: 0, secretHashes: [] });
