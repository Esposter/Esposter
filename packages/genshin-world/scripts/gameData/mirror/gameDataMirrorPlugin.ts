import type { Plugin, ViteDevServer } from "vite";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { readMirroredGameDataObject } from "#scripts/gameData/mirror/readMirroredGameDataObject";
import { getResultAsync } from "@esposter/shared";
import { basename } from "node:path";

// The parity page's and the browser suite's route to the hosted game data: a GET of an object under the local base is
// Answered from the mirror, and anything else is handed on. The preview server of a production build of the page takes
// The same route, so a load measured on the build reads the game data the way the dev server does
const mountGameDataMirror = ({ middlewares }: Pick<ViteDevServer, "middlewares">): void => {
  // The mount path is stripped, so the url left is the object's own name
  middlewares.use(GAME_DATA_LOCAL_BASE_URL, ({ method, url }, response, next) => {
    if (method !== "GET" || !url?.endsWith(".json")) {
      next();
      return;
    }
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(() => readMirroredGameDataObject(basename(url, ".json"))).match(
      (json) => {
        response.setHeader("Content-Type", "application/json");
        response.end(json);
      },
      (error) => {
        next(error);
      },
    );
  });
};

export const gameDataMirrorPlugin: Plugin = {
  apply: "serve",
  configurePreviewServer: mountGameDataMirror,
  configureServer: mountGameDataMirror,
  name: "game-data-mirror",
};
