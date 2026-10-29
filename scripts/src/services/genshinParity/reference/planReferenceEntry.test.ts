import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import type { ReferenceEntryImage } from "#src/models/genshinParity/reference/ReferenceEntryImage";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { readEntryImage as baseReadEntryImage } from "#src/services/genshinParity/reference/readEntryImage";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { planReferenceEntry } from "#src/services/genshinParity/reference/planReferenceEntry";
import { getScratchPlatePath } from "#src/services/genshinParity/shared/getScratchPlatePath";
import { afterEach, describe, expect, test, vi } from "vitest";

const { readEntryImage } = vi.hoisted(() => ({ readEntryImage: vi.fn<typeof baseReadEntryImage>() }));

vi.mock(import("#src/services/genshinParity/reference/readEntryImage"), () => ({ readEntryImage }));

describe(planReferenceEntry, () => {
  const ID = "a";
  const SIZE = 1;
  const MAIN_PATH = "committed/a.webp";
  const OURS = "1".repeat(64);
  const COMMITTED = "0".repeat(64);
  const CAPTURED_AT = new Date(0);
  const MAIN_IMAGE = { bytes: SIZE, height: SIZE, sha256: OURS, width: SIZE };
  const LOCAL_PLATE_IMAGE = { bytes: SIZE, height: SIZE, sha256: "2".repeat(64), width: SIZE };
  const COMMITTED_PLATE_IMAGE = { bytes: SIZE, height: SIZE, sha256: "3".repeat(64), width: SIZE };
  const REFERENCE: ParityReference = {
    plateSource: "plate frame at 2s",
    screen: "ArchiveScreen",
    source: "main frame at 1s",
  };
  const createEntry = (image: typeof MAIN_IMAGE): ReferenceEntryImage => ({
    bytesBefore: 0,
    capturedAt: CAPTURED_AT,
    image,
    isNew: true,
    read: () => Promise.resolve(Buffer.alloc(0)),
    sourceFormat: "webp",
    stored: Buffer.alloc(SIZE),
  });
  const createCommittedRow = (): ParityReferenceManifestRow => ({
    attribution: {},
    bytes: SIZE,
    capturedAt: CAPTURED_AT.toISOString(),
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

  test("a replace whose local plate is present takes the plate from it and writes it", async () => {
    expect.hasAssertions();

    const plate = createEntry(LOCAL_PLATE_IMAGE);
    readEntryImage.mockImplementation((path) =>
      Promise.resolve(path === getScratchPlatePath(ID) ? plate : createEntry(MAIN_IMAGE)),
    );

    const { files, row } = await planReferenceEntry(ID, REFERENCE, MAIN_PATH, undefined, createCommittedRow());

    expect(row?.plate).toStrictEqual(LOCAL_PLATE_IMAGE);
    expect(files.map(({ path }) => path)).toStrictEqual([MAIN_PATH, expect.stringContaining(`${ID}.plate.webp`)]);
  });

  test("a replace whose local plate is absent keeps the committed plate that is on disk, and writes none", async () => {
    expect.hasAssertions();

    // The committed plate file holds the committed hash, so it is read back as the held plate rather than as a new one
    readEntryImage.mockImplementation((path) =>
      Promise.resolve(
        path === getScratchPlatePath(ID)
          ? { ...createEntry(COMMITTED_PLATE_IMAGE), isNew: false, stored: undefined }
          : createEntry(MAIN_IMAGE),
      ),
    );

    const { files, missing, row } = await planReferenceEntry(ID, REFERENCE, MAIN_PATH, undefined, createCommittedRow());

    expect(readEntryImage).toHaveBeenCalledWith(
      getScratchPlatePath(ID),
      COMMITTED_PLATE_IMAGE,
      expect.stringContaining(`${ID}.plate.webp`),
    );
    expect(row?.plate).toStrictEqual(COMMITTED_PLATE_IMAGE);
    expect(missing).toStrictEqual([]);
    expect(files.map(({ path }) => path)).toStrictEqual([MAIN_PATH]);
  });

  test("a replace whose local plate and committed plate file are both absent reports the plate missing and keeps no plate", async () => {
    expect.hasAssertions();

    readEntryImage.mockImplementation((path) =>
      Promise.resolve(path === getScratchPlatePath(ID) ? undefined : createEntry(MAIN_IMAGE)),
    );

    const { missing, row } = await planReferenceEntry(ID, REFERENCE, MAIN_PATH, undefined, createCommittedRow());

    expect(row?.plate).toBeUndefined();
    expect(missing).toStrictEqual([expect.stringContaining(`${ID}.plate`)]);
  });

  test("a replace with no committed row and no local plate leaves no plate", async () => {
    expect.hasAssertions();

    readEntryImage.mockImplementation((path) =>
      Promise.resolve(path === getScratchPlatePath(ID) ? undefined : createEntry(MAIN_IMAGE)),
    );

    const { row } = await planReferenceEntry(ID, REFERENCE, MAIN_PATH, undefined, undefined);

    expect(row?.plate).toBeUndefined();
  });
});
