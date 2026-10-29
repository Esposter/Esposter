import { resolve } from "node:path";

// The World fixture imports the terrain worker as Vite's `?worker` build. The package's own import map cannot name that
// Query: an entry with it fails knip's entry check, and without one `#src/*` resolves the query as part of the file name.
// So the parity page and the browser suite both alias the import to the worker's source, and this is the one piece they share
export const terrainWorkerAlias: Record<string, string> = {
  "#src/workers/terrainTile.worker?worker": resolve(import.meta.dirname, "../src/workers/terrainTile.worker.ts?worker"),
};
