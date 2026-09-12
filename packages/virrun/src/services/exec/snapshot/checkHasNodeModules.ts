import { NODE_MODULES_DIRECTORY } from "#src/services/exec/util/constants";
import { readdirSync } from "node:fs";
import { join } from "node:path";
// A cheap structural probe: does this subtree hold a node_modules anywhere? Short-circuits on the first match and
// Never descends *into* a node_modules — a symlink-dense forest there is nothing to learn from — so it stays a pure
// Readdir walk with no removal cost, runnable even from the host over a `\wsl.localhost` UNC by listing alone.
export const checkHasNodeModules = (directory: string): boolean =>
  readdirSync(directory, { withFileTypes: true }).some(
    (entry) =>
      entry.isDirectory() &&
      (entry.name === NODE_MODULES_DIRECTORY || checkHasNodeModules(join(directory, entry.name))),
  );
