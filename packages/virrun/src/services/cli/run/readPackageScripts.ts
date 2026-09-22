import { PACKAGE_JSON_FILENAME } from "#src/services/exec/util/constants";
import { parseMachineJson } from "#src/services/exec/util/parseMachineJson";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const packageScriptsSchema = z.object({ scripts: z.record(z.string(), z.string()).default({}) });

// The script names a cwd's package.json declares, or none when there is no readable manifest.
export const readPackageScripts = (cwd: string): string[] =>
  getResult(() =>
    packageScriptsSchema.parse(parseMachineJson(readFileSync(join(cwd, PACKAGE_JSON_FILENAME), "utf8"))),
  ).match(
    (packageJson) => Object.keys(packageJson.scripts),
    () => [],
  );
