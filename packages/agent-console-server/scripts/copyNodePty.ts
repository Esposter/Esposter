// Places node-pty's Windows files where the single executable's build embeds them as assets: its code, its worker, the
// Agent it forks and its native addons are all loaded from beside one another, never from inside the executable
import { cpSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const nodePtyDirectory = dirname(createRequire(import.meta.url).resolve("node-pty/package.json"));
const targetDirectory = join(import.meta.dirname, "..", "dist-sea", "node-pty");
cpSync(join(nodePtyDirectory, "package.json"), join(targetDirectory, "package.json"));
cpSync(join(nodePtyDirectory, "lib"), join(targetDirectory, "lib"), {
  filter: (source) => !/\.(?:map|test\.js)$/u.test(source),
  recursive: true,
});
cpSync(join(nodePtyDirectory, "prebuilds", "win32-x64"), join(targetDirectory, "prebuilds", "win32-x64"), {
  filter: (source) => !source.endsWith(".pdb"),
  recursive: true,
});
