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

  test("a replace whose local plate and committed plate file are both absent is refused, naming the plate, and writes nothing", async () => {
    expect.hasAssertions();

    readEntryImage.mockImplementation((path) =>
      Promise.resolve(path === getScratchPlatePath(ID) ? undefined : createEntry(MAIN_IMAGE)),
    );

    const { files, missing, packed, refused, row } = await planReferenceEntry(
      ID,
      REFERENCE,
      MAIN_PATH,
      undefined,
      createCommittedRow(),
    );

    expect({ files, missing, packed, refused, row }).toStrictEqual({
      files: [],
      missing: [{ id: ID, path: expect.stringContaining(`${ID}.plate`) }],
      packed: [],
      refused: true,
      row: undefined,
    });
  });

  test("a replace whose committed plate file holds other bytes than the held hash is refused, and keeps neither plate", async () => {
    expect.hasAssertions();

    // The committed file holds other bytes, so no image is kept for it: the collision is reported and the plate is missing
    readEntryImage.mockImplementation((path) =>
      Promise.resolve(
        path === getScratchPlatePath(ID)
          ? {
              bytesBefore: 0,
              collision: { committed: LOCAL_PLATE_IMAGE.sha256, ours: COMMITTED_PLATE_IMAGE.sha256 },
              isNew: false,
              read: () => Promise.resolve(Buffer.alloc(0)),
            }
          : createEntry(MAIN_IMAGE),
      ),
    );

    const { collisions, missing, refused, row } = await planReferenceEntry(
      ID,
      REFERENCE,
      MAIN_PATH,
      undefined,
      createCommittedRow(),
    );

    expect({ collisions, missing, refused, row }).toStrictEqual({
      collisions: [{ committed: LOCAL_PLATE_IMAGE.sha256, id: ID, ours: COMMITTED_PLATE_IMAGE.sha256 }],
      missing: [{ id: ID, path: expect.stringContaining(`${ID}.plate`) }],
      refused: true,
      row: undefined,
    });
  });

  test("a plain pack whose committed row names a plate its file lacks is refused, and leaves the row unchanged", async () => {
    expect.hasAssertions();

    // The row holds a plate hash, its screenshot is in scratch, and the plate is neither in scratch nor on disk
    readEntryImage.mockImplementation((path) =>
      Promise.resolve(path === getScratchPlatePath(ID) ? undefined : createEntry(MAIN_IMAGE)),
    );

    const { files, missing, packed, refused, row } = await planReferenceEntry(
      ID,
      REFERENCE,
      MAIN_PATH,
      createCommittedRow(),
      createCommittedRow(),
    );

    expect({ files, missing, packed, refused, row }).toStrictEqual({
      files: [],
      missing: [{ id: ID, path: expect.stringContaining(`${ID}.plate`) }],
      packed: [],
      refused: true,
      row: undefined,
    });
  });

  test("an id with no committed row and no scratch copy is missing its files without being refused", async () => {
    expect.hasAssertions();

    readEntryImage.mockResolvedValue(undefined);

    const { missing, refused } = await planReferenceEntry(ID, REFERENCE, MAIN_PATH, undefined, undefined);

    expect({ missing, refused }).toStrictEqual({
      missing: [
        { id: ID, path: MAIN_PATH },
        { id: ID, path: expect.stringContaining(`${ID}.plate`) },
      ],
      refused: false,
    });
  });

  test("reports a file written from a scratch copy over an absent committed file as restored, not as already committed", async () => {
    expect.hasAssertions();

    // The held image's committed file is absent, so the scratch copy is written back under the held hash
    readEntryImage.mockImplementation((path) =>
      Promise.resolve(
        path === getScratchPlatePath(ID)
          ? { ...createEntry(COMMITTED_PLATE_IMAGE), isNew: false }
          : { ...createEntry(MAIN_IMAGE), isNew: false },
      ),
    );

    const { files, held, restored } = await planReferenceEntry(
      ID,
      REFERENCE,
      MAIN_PATH,
      createCommittedRow(),
      createCommittedRow(),
    );

    expect({ files: files.map(({ path }) => path), held, restored }).toStrictEqual({
      files: [MAIN_PATH, expect.stringContaining(`${ID}.plate`)],
      held: [],
      restored: [
        { id: ID, path: MAIN_PATH },
        { id: ID, path: expect.stringContaining(`${ID}.plate`) },
      ],
    });
  });
});
