import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import type { ReferenceEntryImage } from "#src/models/genshinParity/reference/ReferenceEntryImage";
import type { ReferenceEntryPlan } from "#src/models/genshinParity/reference/ReferenceEntryPlan";
import type { ReferencePackFile } from "#src/models/genshinParity/reference/ReferencePackFile";

import { createReferenceManifestRow } from "#src/services/genshinParity/reference/createReferenceManifestRow";
import { getCleanPlateFileName } from "#src/services/genshinParity/reference/getCleanPlateFileName";
import { planCleanPlateObject } from "#src/services/genshinParity/reference/planCleanPlateObject";
import { readEntryImage } from "#src/services/genshinParity/reference/readEntryImage";
import { sortObjectKeys } from "#src/services/genshinParity/reference/sortObjectKeys";
import { getReferenceFileName } from "#src/services/genshinParity/shared/getReferenceFileName";
import { getReferencePlateFileName } from "#src/services/genshinParity/shared/getReferencePlateFileName";
import { getScratchPlatePath } from "#src/services/genshinParity/shared/getScratchPlatePath";
import { getScratchReferencePath } from "#src/services/genshinParity/shared/getScratchReferencePath";

// One reference id's pack: its screenshot, its plate screenshot when its entry names one, and the clean plate filled from
// The one the entry fills from. The row it ends with is the one the manifest holds with those images named by hash, and
// It is returned only when that changed. Nothing is stored here, so a collision is known before any object is written.
// `checkedRow` is the row the local bytes are checked against, which a replace leaves out; `committed` is the manifest's own
// Row, which a replace whose local plate file is absent keeps its plate and clean plate from
export const planReferenceEntry = async (
  id: string,
  reference: ParityReference,
  checkedRow: ParityReferenceManifestRow | undefined,
  committed: ParityReferenceManifestRow | undefined,
): Promise<ReferenceEntryPlan> => {
  const mainLabel = getReferenceFileName(id);
  const plateLabel = getReferencePlateFileName(id);
  const cleanLabel = getCleanPlateFileName(id);
  const main = await readEntryImage(getScratchReferencePath(id), checkedRow);
  if (main === undefined)
    return {
      collisions: [],
      held: [],
      id,
      missing: reference.plateSource === undefined ? [mainLabel] : [mainLabel, plateLabel],
      objects: [],
      packed: [],
    };
  const plate =
    reference.plateSource === undefined ? undefined : await readEntryImage(getScratchPlatePath(id), checkedRow?.plate);
  // A clean plate is filled from the plate its entry names, so a missing plate leaves the entry without one rather than
  // Filling it from the reference
  const cleanInput = reference.plateSource === undefined ? main : plate;
  const clean =
    cleanInput === undefined
      ? undefined
      : await planCleanPlateObject(reference, cleanInput, main.image, checkedRow?.cleanPlate);
  const isPlateMissing = reference.plateSource !== undefined && plate === undefined;
  const base =
    checkedRow ??
    createReferenceManifestRow(
      id,
      main.image,
      main.sourceFormat ?? "unknown",
      reference,
      main.capturedAt ?? new Date(),
    );
  const row: ParityReferenceManifestRow = {
    ...base,
    cleanPlate: clean?.cleanPlate ?? (isPlateMissing ? committed?.cleanPlate : undefined),
    plate: plate?.image ?? (isPlateMissing ? committed?.plate : undefined),
  };
  const changed =
    checkedRow === undefined || JSON.stringify(sortObjectKeys(row)) !== JSON.stringify(sortObjectKeys(checkedRow));
  const images: { entry: ReferenceEntryImage; file: string }[] = [
    { entry: main, file: mainLabel },
    ...(plate === undefined ? [] : [{ entry: plate, file: plateLabel }]),
  ];
  const packed: ReferencePackFile[] = [
    ...images.flatMap(({ entry, file }) =>
      entry.isNew ? [{ bytesAfter: entry.image.bytes, bytesBefore: entry.bytesBefore, file, id, kind: base.kind }] : [],
    ),
    ...(clean?.stored === undefined
      ? []
      : [{ bytesAfter: clean.cleanPlate.bytes, bytesBefore: 0, file: cleanLabel, id, kind: base.kind }]),
  ];
  const held = [
    ...images.flatMap(({ entry, file }) => (entry.isNew ? [] : [file])),
    ...(clean === undefined || clean.stored !== undefined ? [] : [cleanLabel]),
  ];
  return {
    collisions: images.flatMap(({ entry }) =>
      entry.collision === undefined ? [] : [{ committed: entry.collision.committed, id, ours: entry.collision.ours }],
    ),
    held,
    id,
    missing: isPlateMissing ? [plateLabel] : [],
    objects: [
      ...images.flatMap(({ entry }) =>
        entry.stored === undefined ? [] : [{ bytes: entry.stored, sha256: entry.image.sha256 }],
      ),
      ...(clean?.stored === undefined ? [] : [{ bytes: clean.stored, sha256: clean.cleanPlate.sha256 }]),
    ],
    packed,
    row: changed ? row : undefined,
  };
};
