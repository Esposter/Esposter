import { RoutePath } from "#shared/models/router/RoutePath.js";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";

import typedocConfiguration from "../../../typedoc.config.js";

const filenames = await readdir(typedocConfiguration.out, { recursive: true });

for (const filename of filenames) {
  if (extname(filename).toLowerCase() !== ".html") continue;
  const path = `${typedocConfiguration.out}/${filename}`;
  const file = await readFile(path, "utf-8");
  const relativeMarker = "./";
  await writeFile(
    path,
    file.replaceAll(/(href|src)="([^"]*(?:assets|media|modules)[^"]*)"/g, (_, attribute, originalPath) => {
      const lastIndex = originalPath.lastIndexOf(relativeMarker);
      if (lastIndex === -1) return `${attribute}="${RoutePath.Docs}/${originalPath}"`;
      // -1 to insert before the /
      const insertIndex = lastIndex + relativeMarker.length - 1;
      const pathBefore = originalPath.substring(0, insertIndex);
      const pathAfter = originalPath.substring(insertIndex);
      return `${attribute}="${pathBefore}${RoutePath.Docs}${pathAfter}"`;
    }),
  );
}
