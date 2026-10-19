import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { getRunOnBulletLines } from "#src/services/sweeps/runOnBullets/getRunOnBulletLines";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every tracked markdown page's run-on bullets, one `path:line` each
export const readRunOnBulletFindings = (): string[] =>
  readSweepFilePaths("*.md").flatMap((path) =>
    getRunOnBulletLines(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")).map((line) => `${path}:${line}`),
  );
