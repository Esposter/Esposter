import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import type { ReferenceEntryImage } from "#src/models/genshinParity/reference/ReferenceEntryImage";
import type { ReferenceEntryPlan } from "#src/models/genshinParity/reference/ReferenceEntryPlan";
import type { ReferencePackFile } from "#src/models/genshinParity/reference/ReferencePackFile";
import type { ReferenceStoredFile } from "#src/models/genshinParity/reference/ReferenceStoredFile";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { createReferenceManifestRow } from "#src/services/genshinParity/reference/createReferenceManifestRow";
import { readEntryImage } from "#src/services/genshinParity/reference/readEntryImage";
import { sortObjectKeys } from "#src/services/genshinParity/reference/sortObjectKeys";
import { getReferencePlateFilePath } from "#src/services/genshinParity/shared/getReferencePlateFilePath";
import { getScratchPlatePath } from "#src/services/genshinParity/shared/getScratchPlatePath";
import { getScratchReferencePath } from "#src/services/genshinParity/shared/getScratchReferencePath";
import { basename } from "node:path";

// One reference id's pack: its screenshot, and its plate screenshot when its entry names one. The row it ends with is the
// one the manifest holds with those images' hashes, and it is returned only when that changed. The files it writes are the
// packed bytes of a screenshot that is new, replaces the committed one, or is the recovery write: a committed file that is
// absent is written from a scratch copy that holds the held hash. `checkedRow` is the row the local bytes are checked
// against, which a replace leaves out; `committed` is the manifest's own row, whose plate a replace with no local plate
// keeps when the committed plate on disk still holds its hash. Nothing is written here, so a collision is known before any
// file is written. An id with an image missing is refused when it is started, that is the manifest holds it or a scratch
// copy is beside it: a row would name a file that is not there, so it writes nothing and its missing files are named
export const planReferenceEntry = async (
  id: string,
  reference: ParityReference,
  mainPath: string,
  checkedRow: ParityReferenceManifestRow | undefined,
  committed: ParityReferenceManifestRow | undefined,
): Promise<ReferenceEntryPlan> => {
  const platePath = getReferencePlateFilePath(id);
  const main = await readEntryImage(getScratchReferencePath(id), checkedRow, mainPath);
  const plate =
    reference.plateSource === undefined
      ? undefined
      : await readEntryImage(getScratchPlatePath(id), checkedRow?.plate ?? committed?.plate, platePath);
  const collisions = [main, plate].flatMap((entry) =>
    entry?.collision === undefined ? [] : [{ committed: entry.collision.committed, id, ours: entry.collision.ours }],
  );
  const missing = [
    ...(main?.image === undefined ? [mainPath] : []),
    ...(reference.plateSource !== undefined && plate?.image === undefined ? [platePath] : []),
  ];
  if (main?.image === undefined || missing.length > 0)
    return {
      collisions,
      files: [],
      held: [],
      id,
      mainPath,
      missing,
      packed: [],
      refused: committed !== undefined || main !== undefined || plate !== undefined,
      restored: [],
    };
  const base =
    checkedRow ??
    createReferenceManifestRow(
      id,
      main.image,
      main.sourceFormat ?? "unknown",
      reference,
      main.capturedAt ?? new Date(),
    );
  const row: ParityReferenceManifestRow = { ...base, plate: plate?.image };
  const changed =
    checkedRow === undefined || JSON.stringify(sortObjectKeys(row)) !== JSON.stringify(sortObjectKeys(checkedRow));
  const images: { entry: ReferenceEntryImage; path: string }[] = [
    { entry: main, path: mainPath },
    ...(plate === undefined ? [] : [{ entry: plate, path: platePath }]),
  ];
  const packed: ReferencePackFile[] = images.flatMap(({ entry, path }) =>
    entry.isNew && entry.image !== undefined
      ? [{ bytesAfter: entry.image.bytes, bytesBefore: entry.bytesBefore, file: basename(path), id, kind: base.kind }]
      : [],
  );
  return {
    collisions,
    files: images.flatMap(({ entry, path }): ReferenceStoredFile[] =>
      entry.stored === undefined ? [] : [{ bytes: entry.stored, path }],
    ),
    // A file the pack did not write is held, and a file it wrote where the committed one was absent is restored
    held: images.flatMap(({ entry, path }) => (entry.isNew || entry.stored !== undefined ? [] : [{ id, path }])),
    id,
    mainPath,
    missing: [],
    packed,
    refused: false,
    restored: images.flatMap(({ entry, path }) => (!entry.isNew && entry.stored !== undefined ? [{ id, path }] : [])),
    row: changed ? row : undefined,
  };
};
