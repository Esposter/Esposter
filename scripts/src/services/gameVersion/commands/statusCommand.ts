import type { SubCommandsDef } from "citty";

import { formatStaleRow } from "#src/services/gameVersion/formatStaleRow";
import { readInstallStaleRows } from "#src/services/gameVersion/readInstallStaleRows";
import { readLockGameVersion } from "#src/services/gameVersion/readLockGameVersion";
import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { defineCommand } from "citty";

export const statusCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "List the stale outputs by the command that wrote each, with the install's game version, the hosted lock's and the decoder's pin. Writes nothing, and exits 1 while any output is stale",
    name: "status",
  },
  run: async () => {
    const gameVersion = await readGameVersion();
    const rows = await readInstallStaleRows(gameVersion);
    console.log(`install game version: ${gameVersion}`);
    if (rows.length === 0) console.log("no output is stale");
    for (const row of rows) console.log(formatStaleRow(row));
    console.log(`hosted game data lock: ${(await readLockGameVersion()) || "not recorded"}`);
    console.log("decoder constants: not pinned");
    if (rows.length > 0) process.exitCode = 1;
  },
});
