import { RoutePath } from "#shared/models/router/RoutePath";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";

import typedocConfiguration from "../../../typedoc.config.js";

const filenames = await readdir(typedocConfiguration.out, { recursive: true });

for (const filename of filenames) {
  if (extname(filename).toLowerCase() !== ".html") continue;
  const path = `${typedocConfiguration.out}/${filename}`;
  const file = await readFile(path, "utf-8");
  await writeFile(
    path,
    file.replaceAll(/(href|src)="(?!https?:\/\/|#)(.+?)"/g, (_, attribute, originalPath) => {
      const relativeMarker = "./";
      const lastIndex = originalPath.lastIndexOf(relativeMarker);
      if (lastIndex === -1) return `${attribute}="${RoutePath.Docs}/${originalPath}"`;
      // -1 to insert before the /
      const insertIndex = lastIndex + relativeMarker.length - 1;
      const pathAfter = originalPath.substring(insertIndex);
      const newPath = `${RoutePath.Docs}${pathAfter}`;
      return `${attribute}="${newPath}"`;
    }),
  );
}
