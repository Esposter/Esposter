// The configuration Node's --build-sea reads, with every file the build placed beside the bundle as an asset: the
// Claude Code binary, and each of node-pty's files under its path, which the install writes back out as it found them
import { readdirSync, writeFileSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";

const seaDirectory = join(import.meta.dirname, "..", "dist-sea");
const nodePtyAssets = readdirSync(join(seaDirectory, "node-pty"), { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => {
    const assetPath = relative(seaDirectory, join(entry.parentPath, entry.name)).split(sep).join(posix.sep);
    return [assetPath, `dist-sea/${assetPath}`] as const;
  });
writeFileSync(
  join(seaDirectory, "sea-config.json"),
  JSON.stringify({
    assets: Object.fromEntries([["claude.exe", "dist-sea/claude.exe"], ...nodePtyAssets]),
    disableExperimentalSEAWarning: true,
    main: "dist-sea/host.mjs",
    mainFormat: "module",
    output: "dist-sea/agent-console-host.exe",
  }),
);
