import { run } from "#src/services/recreation/animeStudio/run";
import { availableParallelism } from "node:os";
import { join } from "node:path";

export const buildCmakeLibrary = (source: string, build: string, options: string[], output: string): string => {
  run("cmake", ["-S", source, "-B", build, "-DCMAKE_BUILD_TYPE=Release", ...options]);
  run("cmake", ["--build", build, "--config", "Release", "-j", String(availableParallelism())]);
  return join(build, output);
};
