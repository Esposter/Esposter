import type { Plugin, ViteDevServer } from "vite";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { parseGameDataObjectPath } from "#scripts/gameData/mirror/parseGameDataObjectPath";
import { readMirroredGameDataObject } from "#scripts/gameData/mirror/readMirroredGameDataObject";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";

// The parity page's and the browser suite's route to the hosted game data: a GET of an object under the local base is
// Answered from the mirror, and anything else is handed on. The preview server of a production build of the page takes
// The same route, so a load measured on the build reads the game data the way the dev server does
const mountGameDataMirror = ({ middlewares }: Pick<ViteDevServer, "middlewares">): void => {
  // The mount path is stripped, so the url left is the object's dataset and then its own name
  middlewares.use(GAME_DATA_LOCAL_BASE_URL, ({ method, url }, response, next) => {
    if (method !== "GET" || !url?.endsWith(".json")) {
      next();
      return;
    }
    getSynchronizedFunction(() =>
      getResultAsync(() => {
        const { dataset, hash } = parseGameDataObjectPath(url);
        return readMirroredGameDataObject(dataset, hash);
      }).match(
        (json) => {
          response.setHeader("Content-Type", "application/json");
          response.end(json);
        },
        (error) => {
          next(error);
        },
      ),
    )();
  });
};

export const gameDataMirrorPlugin: Plugin = {
  apply: "serve",
  configurePreviewServer: mountGameDataMirror,
  configureServer: mountGameDataMirror,
  name: "game-data-mirror",
};
