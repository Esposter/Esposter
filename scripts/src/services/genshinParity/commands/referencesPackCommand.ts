import type { SubCommandsDef } from "citty";

import { ReferencePackKind } from "#src/models/genshinParity/reference/ReferencePackKind";
import { createReferenceObjectTargets } from "#src/services/genshinParity/reference/createReferenceObjectTargets";
import { formatCollisionBlock } from "#src/services/genshinParity/reference/formatCollisionBlock";
import { formatMebibytes } from "#src/services/genshinParity/reference/formatMebibytes";
import { formatPackTable } from "#src/services/genshinParity/reference/formatPackTable";
import { packManifestPaths } from "#src/services/genshinParity/reference/packManifestPaths";
import { packReferences } from "#src/services/genshinParity/reference/packReferences";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const referencesPackCommand: SubCommandsDef[string] = defineCommand({
  args: {
    "dry-run": {
      default: false,
      description: "Print what would be packed and stored, and store nothing",
      type: "boolean",
    },
    kind: {
      default: ReferencePackKind.Reference,
      description:
        "reference packs the screenshots the map names; recording and record store the files given as paths, a record kept in the parity folder",
      options: Object.values(ReferencePackKind),
      type: "enum",
    },
    replace: {
      description:
        "Comma-separated reference ids whose local bytes replace their committed rows; the old objects stay in the container, unreferenced",
      type: "string",
    },
    "skip-colliding": {
      default: false,
      description:
        "Leave out each reference whose bytes differ from its committed row, store the rest, and list the ones left out",
      type: "boolean",
    },
  },
  meta: {
    description:
      "Pack and store the references the map names, or with --kind recording or record the files given as paths, and merge their rows into the manifest",
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
      const outcome = await packReferences(isDryRun, createReferenceObjectTargets(), {
        replace,
        skipColliding: args["skip-colliding"],
      });
      console.log(formatPackTable(outcome));
      // The colliding ids come last, as one line, where a session that reruns the pack reads them
      if (outcome.skipped.length > 0) console.log(formatCollisionBlock(outcome.skipped));
      return;
    }
    // Collisions are a reference's, so the flags are refused for a recording or a record rather than ignored
    if (args.replace !== undefined || args["skip-colliding"])
      throw new InvalidOperationError(
        Operation.Read,
        args.kind,
        "takes no --replace or --skip-colliding: those are references'",
      );
    if (paths.length === 0)
      throw new InvalidOperationError(Operation.Read, args.kind, "needs at least one path to pack");
    const { packed, uploads } = await packManifestPaths(args.kind, paths, isDryRun, createReferenceObjectTargets());
    for (const { bytes, name } of packed) console.log(`${name}  ${formatMebibytes(bytes)}`);
    console.log(
      `${packed.length} ${args.kind} files, ${uploads} uploads${isDryRun ? " (dry run, nothing stored)" : ""}`,
    );
  },
});
