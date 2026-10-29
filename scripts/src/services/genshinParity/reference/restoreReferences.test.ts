import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { restoreReferences } from "#src/services/genshinParity/reference/restoreReferences";
import { describe, expect, test, vi } from "vitest";

describe(restoreReferences, () => {
  const BYTES = 1;
  const HASH = "0".repeat(64);
  const OTHER_HASH = "1".repeat(64);
  const createRow = (overrides: Partial<ParityReferenceManifestRow>): ParityReferenceManifestRow => ({
    attribution: {},
    bytes: BYTES,
    capturedAt: new Date(0).toISOString(),
    height: BYTES,
    id: "a",
    kind: ParityReferenceKind.Other,
    sha256: HASH,
    sourceFormat: "png",
    width: BYTES,
    ...overrides,
  });

  test("makes each distinct image present once, however many rows name it", async () => {
    expect.hasAssertions();
    const plate = { bytes: BYTES, height: BYTES, sha256: OTHER_HASH, width: BYTES };
    const rows = [createRow({ plate }), createRow({ id: "b", plate, sha256: OTHER_HASH })];
    const ensure = vi.fn((sha256: string) => Promise.resolve(sha256));
    const restored = await restoreReferences(rows, ensure);
    expect(restored).toStrictEqual({ bytes: BYTES * 2, count: 2 });
    expect(ensure).toHaveBeenCalledTimes(2);
  });
});
