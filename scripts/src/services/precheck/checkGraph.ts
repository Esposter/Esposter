import type { GeneratedFileCheck } from "#src/models/precheck/GeneratedFileCheck";

import { GRAPH_FILENAME } from "#src/services/dependencyGraph/constants";
import { readGraph } from "#src/services/dependencyGraph/readGraph";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// The committed graph against what the generator draws from the workspace today. With `fix`, the drawing is written over it
export const checkGraph = async (fix: boolean): Promise<GeneratedFileCheck> => {
  const graphPath = resolve(REPOSITORY_ROOT, GRAPH_FILENAME);
  const { svg } = await readGraph();
  if (readFileSync(graphPath, "utf8") === svg) return { findings: [], regenerated: [] };
  if (fix) {
    writeFileSync(graphPath, svg);
    return { findings: [], regenerated: [GRAPH_FILENAME] };
  }
  return { findings: [`stale ${GRAPH_FILENAME}`, "fix: pnpm ai:precheck --fix"], regenerated: [] };
};
