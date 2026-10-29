import type { ReferenceObjectTarget } from "#src/models/genshinParity/reference/ReferenceObjectTarget";
import type { ReferencePackOptions } from "#src/models/genshinParity/reference/ReferencePackOptions";
import type { ReferencePackOutcome } from "#src/models/genshinParity/reference/ReferencePackOutcome";

import {
  REFERENCE_OBJECT_EXTENSION,
  REFERENCE_PACK_CONCURRENCY,
} from "#src/services/genshinParity/reference/constants";
import { countUnnamedScratchFiles } from "#src/services/genshinParity/reference/countUnnamedScratchFiles";
import { formatCollisionBlock } from "#src/services/genshinParity/reference/formatCollisionBlock";
import { getObjectBlobName } from "#src/services/genshinParity/reference/getObjectBlobName";
import { planReferenceEntry } from "#src/services/genshinParity/reference/planReferenceEntry";
import { planReferencePack } from "#src/services/genshinParity/reference/planReferencePack";
import { putReferenceObject } from "#src/services/genshinParity/reference/putReferenceObject";
import { readKnownGameVersion } from "#src/services/genshinParity/reference/readKnownGameVersion";
import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";
import { writeManifestFile } from "#src/services/genshinParity/reference/writeManifestFile";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { CONTENT_CACHE_DIRECTORY, readContentAddressedObject } from "@esposter/shared-node/cache";
import { join } from "node:path";

// Plans every reference the map names, then stores the objects each account lacks and writes the manifest for the plans
// `planReferencePack` keeps. A collision the options do not resolve refuses the run before anything is written. Each object
// is first placed in the download cache under its hash, so its upload streams from that path. Objects go up before the
// manifest names them. A dry run plans and reports the same outcome and stores nothing
export const packReferences = async (
  isDryRun: boolean,
  targets: ReferenceObjectTarget[],
  options: ReferencePackOptions,
): Promise<ReferencePackOutcome> => {
  const manifest = await readManifestFile();
  const entries = Object.entries(ParityReferenceMap).filter(([, { pending }]) => pending === undefined);
  // A replaced id's local bytes are checked against no committed row, so the bytes it packs to are its local ones and it
  // writes a new row; the committed row still backs the plate it keeps where its local plate is absent
  const plans = await settleAll(
    entries.map(([id, reference]) => () => {
      const committed = manifest.references.find((row) => row.id === id);
      return planReferenceEntry(id, reference, options.replace.includes(id) ? undefined : committed, committed);
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
  // Identical bytes under two ids are one object, so each is stored once rather than raced against itself
  const objects = [
    ...new Map(stored.flatMap(({ objects }) => objects).map((object) => [object.sha256, object])).values(),
  ];
  let uploads = 0;
  if (!isDryRun) {
    const counts = await settleAll(
      objects.map(({ bytes, sha256 }) => async () => {
        await readContentAddressedObject(sha256, () => Promise.resolve(bytes));
        return putReferenceObject(
          getObjectBlobName(sha256, REFERENCE_OBJECT_EXTENSION),
          join(CONTENT_CACHE_DIRECTORY, sha256),
          targets,
        );
      }),
      REFERENCE_PACK_CONCURRENCY,
    );
    uploads = counts.reduce((total, count) => total + count, 0);
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
    objects: objects.length,
    packed: stored.flatMap(({ packed }) => packed),
    replaced: decision.replaced,
    skipped: decision.skipped,
    unnamed: await countUnnamedScratchFiles(entries.map(([id]) => id)),
    uploads,
  };
};
