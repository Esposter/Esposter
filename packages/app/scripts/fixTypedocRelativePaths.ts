import { readFile, writeFile } from "node:fs/promises";

import typedocConfiguration from "../../../typedoc.config.js";
import { RoutePath } from "../shared/models/router/RoutePath.ts";

const ASSETS_FOLDER_PATH = "assets";
const MEDIA_FOLDER_PATH = "media";
const HREF_ATTRIBUTE = "href";
const SRC_ATTRIBUTE = "src";
const filenames = ["hierarchy.html", "index.html", "modules.html"];

for (const filename of filenames) {
  const path = `${typedocConfiguration.out}/${filename}`;
  const file = await readFile(path, "utf-8");
  await writeFile(
    path,
    file.replaceAll(
      new RegExp(`(${HREF_ATTRIBUTE}|${SRC_ATTRIBUTE})="(${ASSETS_FOLDER_PATH}|${MEDIA_FOLDER_PATH})`, "g"),
      `$1="${RoutePath.Docs}/$2`,
    ),
  );
}
