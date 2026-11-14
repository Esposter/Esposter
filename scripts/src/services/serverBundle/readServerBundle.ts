import type { ServerBundleFile } from "#src/models/serverBundle/ServerBundleFile";

import { SERVER_BUNDLE_EXTENSIONS } from "#src/services/serverBundle/constants";
import { readdirSync, statSync } from "node:fs";
import { extname, relative, resolve } from "node:path";

// Every file under `directory` that a Worker would load as code, with its size and its path from `directory`, `/` separated
export const readServerBundle = (directory: string): ServerBundleFile[] =>
  readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && SERVER_BUNDLE_EXTENSIONS.includes(extname(entry.name)))
    .map(({ name, parentPath }) => {
      const filePath = resolve(parentPath, name);
      return { bytes: statSync(filePath).size, file: relative(directory, filePath).replaceAll("\\", "/") };
    });
