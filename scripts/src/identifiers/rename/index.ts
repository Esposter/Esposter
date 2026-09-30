import type { RenameMap } from "#src/models/identifiers/rename/RenameMap";

import { renameSource } from "#src/services/identifiers/rename/renameSource";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { defineCommand, runMain } from "citty";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

await runMain(
  defineCommand({
    args: {
      // Read relative to where the command runs, so the map can live in a scratchpad
      renameMap: { description: "The path of a rename map (RenameMap)", required: true, type: "positional" },
    },
    meta: {
      // The typecheck that follows finds what no map can see
      description: "Rename every name a rename map holds across the repository's sources, printing each file rewritten",
      name: "ai:identifiers:rename",
    },
    run: ({ args }) => {
      const renameMap = parseMachineJson<RenameMap>(
        readFileSync(resolve(process.env.INIT_CWD ?? process.cwd(), args.renameMap), "utf8"),
      );
      for (const path of readSweepFilePaths("*.ts", "*.mts", "*.vue")) {
        const absolutePath = resolve(REPOSITORY_ROOT, path);
        const text = readFileSync(absolutePath, "utf8");
        const isSource = renameMap.sources.some((source) => path.startsWith(`${source}/`));
        const renamedText = renameSource(path, text, renameMap, isSource);
        if (renamedText === text) continue;

        writeFileSync(absolutePath, renamedText);
        console.info(path);
      }
    },
  }),
);
