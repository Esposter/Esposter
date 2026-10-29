import type { ReferenceObjectTarget } from "#src/models/genshinParity/reference/ReferenceObjectTarget";
import type { ReferencePackOutcome } from "#src/models/genshinParity/reference/ReferencePackOutcome";

import {
  REFERENCE_OBJECT_EXTENSION,
  REFERENCE_PACK_CONCURRENCY,
} from "#src/services/genshinParity/reference/constants";
import { countUnnamedScratchFiles } from "#src/services/genshinParity/reference/countUnnamedScratchFiles";
import { getObjectBlobName } from "#src/services/genshinParity/reference/getObjectBlobName";
import { planReferenceEntry } from "#src/services/genshinParity/reference/planReferenceEntry";
import { putReferenceObject } from "#src/services/genshinParity/reference/putReferenceObject";
import { readKnownGameVersion } from "#src/services/genshinParity/reference/readKnownGameVersion";
import { readManifestFile } from "#src/services/genshinParity/reference/readManifestFile";
import { writeManifestFile } from "#src/services/genshinParity/reference/writeManifestFile";
import { ParityReferenceMap } from "#src/services/genshinParity/shared/ParityReferenceMap";
import { CONTENT_CACHE_DIRECTORY, readContentAddressedObject } from "@esposter/shared-node/cache";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { join } from "node:path";

// Plans every reference the map names, and when no entry conflicts, stores the objects each account lacks and writes the
// manifest. Each object is first placed in the download cache under its hash, so its upload streams from that path. Objects go
// up before the manifest names them. A dry run plans and reports the same outcome and stores nothing
export const packReferences = async (
  isDryRun: boolean,
  targets: ReferenceObjectTarget[],
): Promise<ReferencePackOutcome> => {
  const manifest = await readManifestFile();
  const entries = Object.entries(ParityReferenceMap).filter(([, { pending }]) => pending === undefined);
  const plans = await settleAll(
    entries.map(
      ([id, reference]) =>
        () =>
          planReferenceEntry(
            id,
            reference,
            manifest.references.find((row) => row.id === id),
          ),
    ),
    REFERENCE_PACK_CONCURRENCY,
  );
  const conflicts = plans.flatMap(({ conflicts }) => conflicts);
  if (conflicts.length > 0) throw new InvalidOperationError(Operation.Create, "references", conflicts.join("; "));
  // Identical bytes under two ids are one object, so each is stored once rather than raced against itself
  const objects = [
    ...new Map(plans.flatMap(({ objects }) => objects).map((object) => [object.sha256, object])).values(),
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
    const rows = plans.flatMap(({ row }) => (row === undefined ? [] : [row]));
    const changedIds = new Set(rows.map(({ id }) => id));
    await writeManifestFile({
      ...manifest,
      gameVersion: (await readKnownGameVersion()) ?? manifest.gameVersion,
      references: [...manifest.references.filter(({ id }) => !changedIds.has(id)), ...rows],
    });
  }
  return {
    held: plans.flatMap(({ held }) => held),
    missing: plans.flatMap(({ missing }) => missing),
    objects: objects.length,
    packed: plans.flatMap(({ packed }) => packed),
    unnamed: await countUnnamedScratchFiles(entries.map(([id]) => id)),
    uploads,
  };
};
