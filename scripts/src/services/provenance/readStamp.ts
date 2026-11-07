import type { Provenance } from "#src/models/provenance/Provenance";

import { provenanceSchema } from "#src/models/provenance/Provenance";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

// The stamp at a path, parsed and checked, or undefined when no stamp is there
export const readStamp = async (path: string): Promise<Provenance | undefined> => {
  if (!existsSync(path)) return undefined;
  return provenanceSchema.parse(parseMachineJson(await readFile(path, "utf8")));
};
