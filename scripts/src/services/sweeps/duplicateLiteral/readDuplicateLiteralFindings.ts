import type { DuplicateLiteralFinding } from "#src/models/sweeps/duplicateLiteral/DuplicateLiteralFinding";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getDuplicateLiteralFindings } from "#src/services/sweeps/duplicateLiteral/getDuplicateLiteralFindings";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The app and package source the file-organization pass names a duplicate constant in, read as text
export const readDuplicateLiteralFindings = (): DuplicateLiteralFinding[] =>
  getDuplicateLiteralFindings(
    readSweepFilePaths("apps/web/app", "apps/web/server", "apps/web/shared", "packages/*/src")
      .filter((path) => path.endsWith(".ts") || path.endsWith(".vue"))
      .map((path) => ({ path, text: readFileSync(resolve(REPOSITORY_ROOT, path), "utf8") })),
  );
