import type { SubCommandsDef } from "citty";

import { ReferencePackKind } from "#src/models/genshinParity/reference/ReferencePackKind";
import { createRecordObjectTargets } from "#src/services/genshinParity/reference/createRecordObjectTargets";
import { formatCollisionBlock } from "#src/services/genshinParity/reference/formatCollisionBlock";
import { formatMebibytes } from "#src/services/genshinParity/reference/formatMebibytes";
import { formatPackTable } from "#src/services/genshinParity/reference/formatPackTable";
import { packRecordPaths } from "#src/services/genshinParity/reference/packRecordPaths";
import { packReferences } from "#src/services/genshinParity/reference/packReferences";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const referencesPackCommand: SubCommandsDef[string] = defineCommand({
  args: {
    "dry-run": {
      default: false,
      description: "Print what would be written and stored, and write nothing",
      type: "boolean",
    },
    kind: {
      default: ReferencePackKind.Reference,
      description:
        "reference writes the screenshots the map names into the repository; record stores the files given as paths in the game-data container",
      options: Object.values(ReferencePackKind),
      type: "enum",
    },
    replace: {
      description:
        "Comma-separated reference ids whose local bytes replace their committed files and rows, the old bytes leaving the tree with them",
      type: "string",
    },
    "skip-colliding": {
      default: false,
      description:
        "Leave out each reference whose bytes differ from its committed file, write the rest, and list the ones left out",
      type: "boolean",
    },
  },
  meta: {
    description:
      "Write the references the map names into the repository as lossless WebP and merge their rows into the manifest, or with --kind record store the files given as paths",
    name: "pack",
  },
  run: async ({ args }) => {
    const paths = args._;
    const isDryRun = args["dry-run"];
    if (args.kind === ReferencePackKind.Reference) {
      // The references' names come from the map, so a path given with them is refused rather than ignored
      if (paths.length > 0)
        throw new InvalidOperationError(
          Operation.Read,
          paths.join(" "),
          "names no path: a reference is packed from its map entry",
        );
      const replace = args.replace?.split(",").map((id) => id.trim()) ?? [];
      const outcome = await packReferences(isDryRun, { replace, skipColliding: args["skip-colliding"] });
      console.log(formatPackTable(outcome));
      // The colliding ids come last, as one line, where a session that reruns the pack reads them
      if (outcome.skipped.length > 0) console.log(formatCollisionBlock(outcome.skipped));
      // An id refused for a missing input is named in the table; the others were packed, and the run exits 1 for it
      if (outcome.refused.length > 0) process.exitCode = 1;
      return;
    }
    // Collisions are a reference's, so the flags are refused for a record rather than ignored
    if (args.replace !== undefined || args["skip-colliding"])
      throw new InvalidOperationError(
        Operation.Read,
        args.kind,
        "takes no --replace or --skip-colliding: those are references'",
      );
    if (paths.length === 0)
      throw new InvalidOperationError(Operation.Read, args.kind, "needs at least one path to pack");
    const { packed, uploads } = await packRecordPaths(paths, isDryRun, createRecordObjectTargets());
    for (const { bytes, path } of packed) console.log(`${path}  ${formatMebibytes(bytes)}`);
    console.log(
      `${packed.length} ${args.kind} files, ${uploads} uploads${isDryRun ? " (dry run, nothing stored)" : ""}`,
    );
  },
});
