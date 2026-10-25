import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const readSource = (path: string): readonly [string, string] =>
  [path, readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")] as const;
