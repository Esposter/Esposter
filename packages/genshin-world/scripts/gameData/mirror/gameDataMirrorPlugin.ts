import type { Plugin, ViteDevServer } from "vite";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { parseGameDataObjectPath } from "#scripts/gameData/mirror/parseGameDataObjectPath";
import { readMirroredGameDataFile } from "#scripts/gameData/mirror/readMirroredGameDataFile";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";

// The parity page's and the browser suite's route to the hosted game data: a GET of a hosted file under the local base
// Is answered from the mirror, and anything else is handed on. The preview server of a production build of the page
// Takes the same route, so a load measured on the build reads the game data the way the dev server does
const mountGameDataMirror = ({ middlewares }: Pick<ViteDevServer, "middlewares">): void => {
  // The mount path is stripped, so the url left is the file's path under the base, with the query its url carries
  middlewares.use(GAME_DATA_LOCAL_BASE_URL, ({ method, url }, response, next) => {
    const gameDataObject = method === "GET" && url !== undefined ? parseGameDataObjectPath(url) : undefined;
    if (gameDataObject === undefined) {
      next();
      return;
    }
    getSynchronizedFunction(() =>
      getResultAsync(() => readMirroredGameDataFile(gameDataObject.sourcePath, gameDataObject.hash)).match(
        (bytes) => {
          response.setHeader("Content-Type", gameDataObject.contentType);
          response.end(bytes);
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
