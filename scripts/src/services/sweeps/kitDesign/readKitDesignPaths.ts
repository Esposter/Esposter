import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getKitDesignPaths } from "#src/services/sweeps/kitDesign/getKitDesignPaths";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export const readKitDesignPaths = (kit: string): string[] =>
  getKitDesignPaths(kit, (path) => existsSync(resolve(REPOSITORY_ROOT, path)));
