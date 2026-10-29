import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import type { ReferenceEntryImage } from "#src/models/genshinParity/reference/ReferenceEntryImage";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { planCleanPlateObject as basePlanCleanPlateObject } from "#src/services/genshinParity/reference/planCleanPlateObject";
import { planReferenceEntry } from "#src/services/genshinParity/reference/planReferenceEntry";
import { readEntryImage as baseReadEntryImage } from "#src/services/genshinParity/reference/readEntryImage";
import { getScratchPlatePath } from "#src/services/genshinParity/shared/getScratchPlatePath";
import { afterEach, describe, expect, test, vi } from "vitest";

const { planCleanPlateObject, readEntryImage } = vi.hoisted(() => ({
  planCleanPlateObject: vi.fn<typeof basePlanCleanPlateObject>(),
  readEntryImage: vi.fn<typeof baseReadEntryImage>(),
}));

vi.mock(import("#src/services/genshinParity/reference/planCleanPlateObject"), () => ({ planCleanPlateObject }));
vi.mock(import("#src/services/genshinParity/reference/readEntryImage"), () => ({ readEntryImage }));

describe(planReferenceEntry, () => {
  const ID = "a";
  const SIZE = 1;
  const OURS = "1".repeat(64);
  const COMMITTED = "0".repeat(64);
  const CAPTURED_AT = new Date(0);
  const MAIN_IMAGE = { bytes: SIZE, height: SIZE, sha256: OURS, width: SIZE };
  const LOCAL_PLATE_IMAGE = { bytes: SIZE, height: SIZE, sha256: "2".repeat(64), width: SIZE };
  const COMMITTED_PLATE_IMAGE = { bytes: SIZE, height: SIZE, sha256: "3".repeat(64), width: SIZE };
  const COMMITTED_CLEAN_PLATE = {
    bytes: SIZE,
    digest: "4".repeat(64),
    height: SIZE,
    sha256: "5".repeat(64),
    width: SIZE,
  };
  const FILLED_CLEAN_PLATE = { bytes: SIZE, digest: "6".repeat(64), height: SIZE, sha256: "7".repeat(64), width: SIZE };
  const REFERENCE: ParityReference = { plateSource: "plate frame at 2s", source: "main frame at 1s" };
  const createEntry = (image: typeof MAIN_IMAGE): ReferenceEntryImage => ({
    bytesBefore: 0,
    capturedAt: CAPTURED_AT,
    image,
    isNew: true,
    read: async () => Buffer.alloc(0),
    sourceFormat: "webp",
  });
  const createCommittedRow = (): ParityReferenceManifestRow => ({
    attribution: {},
    bytes: SIZE,
    capturedAt: CAPTURED_AT.toISOString(),
    cleanPlate: COMMITTED_CLEAN_PLATE,
    height: SIZE,
    id: ID,
    kind: ParityReferenceKind.Other,
    plate: COMMITTED_PLATE_IMAGE,
    sha256: COMMITTED,
    sourceFormat: "webp",
    width: SIZE,
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("a replace whose local plate is present takes the clean plate filled from it", async () => {
    expect.hasAssertions();

    const plate = createEntry(LOCAL_PLATE_IMAGE);
    readEntryImage.mockImplementation(async (path) =>
      path === getScratchPlatePath(ID) ? plate : createEntry(MAIN_IMAGE),
    );
    planCleanPlateObject.mockResolvedValue({ cleanPlate: FILLED_CLEAN_PLATE, stored: Buffer.alloc(0) });

    const { row } = await planReferenceEntry(ID, REFERENCE, undefined, createCommittedRow());

    expect(row?.plate).toStrictEqual(LOCAL_PLATE_IMAGE);
    expect(row?.cleanPlate).toStrictEqual(FILLED_CLEAN_PLATE);
  });

  test("a replace whose local plate is absent keeps the committed plate and clean plate", async () => {
    expect.hasAssertions();

    readEntryImage.mockImplementation(async (path) =>
      path === getScratchPlatePath(ID) ? undefined : createEntry(MAIN_IMAGE),
    );

    const { row } = await planReferenceEntry(ID, REFERENCE, undefined, createCommittedRow());

    expect(planCleanPlateObject).not.toHaveBeenCalled();
    expect(row?.plate).toStrictEqual(COMMITTED_PLATE_IMAGE);
    expect(row?.cleanPlate).toStrictEqual(COMMITTED_CLEAN_PLATE);
  });

  test("a replace with no committed row and no local plate leaves no plate or clean plate", async () => {
    expect.hasAssertions();

    readEntryImage.mockImplementation(async (path) =>
      path === getScratchPlatePath(ID) ? undefined : createEntry(MAIN_IMAGE),
    );

    const { row } = await planReferenceEntry(ID, REFERENCE, undefined, undefined);

    expect(row?.plate).toBeUndefined();
    expect(row?.cleanPlate).toBeUndefined();
  });
});
