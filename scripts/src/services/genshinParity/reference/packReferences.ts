import type { ReferencePackOptions } from "#src/models/genshinParity/reference/ReferencePackOptions";
import type { ReferencePackOutcome } from "#src/models/genshinParity/reference/ReferencePackOutcome";
import type { ReferenceStoredFile } from "#src/models/genshinParity/reference/ReferenceStoredFile";

import { REFERENCE_PACK_CONCURRENCY } from "#src/services/genshinParity/reference/constants";
import { countUnnamedScratchFiles } from "#src/services/genshinParity/reference/countUnnamedScratchFiles";
import { formatCollisionBlock } from "#src/services/genshinParity/reference/formatCollisionBlock";
import { planReferenceEntry } from "#src/services/genshinParity/reference/planReferenceEntry";
import { planReferencePack } from "#src/services/genshinParity/reference/planReferencePack";
import { readKnownGameVersion } from "#src/services/genshinParity/reference/readKnownGameVersion";
import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";
import { readReferenceFiles } from "#src/services/genshinParity/reference/readReferenceFiles";
import { writeManifestFile } from "#src/services/genshinParity/reference/writeManifestFile";
import { writePartialThenMove } from "#src/services/shared/writePartialThenMove";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";

// Plans every reference the map names, then writes the files `planReferencePack` keeps and the manifest that names them. A
// collision the options do not resolve refuses the run before anything is written. A dry run plans and reports the same
// outcome and writes nothing
export const packReferences = async (
  isDryRun: boolean,
  options: ReferencePackOptions,
): Promise<ReferencePackOutcome> => {
  const manifest = await readManifestFile();
  const references = await readReferenceFiles();
  // A replaced id's local bytes are checked against no committed row, so the bytes it packs to are its local ones and it
  // writes a new row; the committed row still backs the plate it reads where its local plate is absent
  const plans = await settleAll(
    references.map(({ id, path, reference }) => () => {
      const committed = manifest.references.find((row) => row.id === id);
      return planReferenceEntry(id, reference, path, options.replace.includes(id) ? undefined : committed, committed);
    }),
    REFERENCE_PACK_CONCURRENCY,
  );
  const decision = planReferencePack(plans, options);
  if (decision.blocked.length > 0)
    throw new InvalidOperationError(
      Operation.Create,
      "references",
      `${formatCollisionBlock(decision.blocked)}; rerun with --skip-colliding to leave them out, or --replace <ids> for those whose local bytes should win`,
    );
  const { stored } = decision;
  const files: ReferenceStoredFile[] = stored.flatMap((plan) => plan.files);
  if (!isDryRun) {
    await settleAll(
      files.map(
        ({ bytes, path }) =>
          () =>
            writePartialThenMove(path, bytes),
      ),
      REFERENCE_PACK_CONCURRENCY,
    );
    const rows = stored.flatMap(({ row }) => (row === undefined ? [] : [row]));
    const changedIds = new Set(rows.map(({ id }) => id));
    await writeManifestFile({
      ...manifest,
      gameVersion: (await readKnownGameVersion()) ?? manifest.gameVersion,
      references: [...manifest.references.filter(({ id }) => !changedIds.has(id)), ...rows],
    });
  }
  return {
    held: stored.flatMap(({ held }) => held),
    missing: stored.flatMap(({ missing }) => missing),
    packed: stored.flatMap(({ packed }) => packed),
    replaced: decision.replaced,
    skipped: decision.skipped,
    unnamed: await countUnnamedScratchFiles(references.map(({ id }) => id)),
    written: isDryRun ? 0 : files.length,
  };
};
