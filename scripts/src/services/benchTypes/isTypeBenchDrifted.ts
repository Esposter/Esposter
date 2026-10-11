import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getTypeBenchResultPath } from "#src/services/benchTypes/getTypeBenchResultPath";
import { renderTypeBench } from "#src/services/benchTypes/renderTypeBench";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// A committed result that is missing, or differs from a fresh measurement by one count, is drift
export const isTypeBenchDrifted = (sourcePath: string): boolean => {
  const resultPath = resolve(REPOSITORY_ROOT, getTypeBenchResultPath(sourcePath));
  const committed = existsSync(resultPath) ? readFileSync(resultPath, "utf8") : undefined;
  return committed !== renderTypeBench(sourcePath);
};
