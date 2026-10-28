import type { ViteDevServer } from "vite";

import { getResultAsync } from "@esposter/shared";
import { readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

// The region data the app serves from its public assets, served here from the world package's copy of it. The dev
// Server, its bundled mode and a production build's preview all take this route, so each region's fetch answers the
// Same way on all of them, where a raw source path answers only the unbundled dev server
const REGION_DATA_DIRECTORY = resolve(import.meta.dirname, "../src/data/regions");
const REGION_DATA_BASE_URL = "/regions";

export const mountRegionData = ({ middlewares }: Pick<ViteDevServer, "middlewares">): void => {
  middlewares.use(REGION_DATA_BASE_URL, ({ method, url }, response, next) => {
    if (method !== "GET" || !url?.endsWith(".json")) {
      next();
      return;
    }
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(() => readFile(join(REGION_DATA_DIRECTORY, basename(url)))).match(
      (json) => {
        response.setHeader("Content-Type", "application/json");
        response.end(json);
      },
      () => {
        next();
      },
    );
  });
};
