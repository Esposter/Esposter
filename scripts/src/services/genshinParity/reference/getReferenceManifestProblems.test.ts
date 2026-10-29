import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";
import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { getCleanPlateDigest } from "#src/services/genshinParity/reference/getCleanPlateDigest";
import { getReferenceManifestProblems } from "#src/services/genshinParity/reference/getReferenceManifestProblems";
import { describe, expect, test } from "vitest";

describe(getReferenceManifestProblems, () => {
  const ID = "a";
  const HASH = "0".repeat(64);
  const OTHER_HASH = "1".repeat(64);
  const DIGEST = "0".repeat(16);
  const SIZE = 2;
  const createRow = (overrides: Partial<ParityReferenceManifestRow> = {}): ParityReferenceManifestRow => ({
    attribution: {},
    bytes: 1,
    capturedAt: new Date(0).toISOString(),
    height: SIZE,
    id: ID,
    kind: ParityReferenceKind.Other,
    sha256: HASH,
    sourceFormat: "png",
    width: SIZE,
    ...overrides,
  });
  // An entry whose clean plate is filled from one pixel of its frame, so its regions are not the whole frame
  const REGION = { height: 1, width: 1, x: 0, y: 0 };
  const backdropReference: ParityReference = { isBackdrop: true, region: REGION, screen: "", source: "a.mp4 at 0s" };

  test("reports nothing when a row and its entry agree", () => {
    expect.hasAssertions();
    const references: Record<string, ParityReference> = { [ID]: { screen: "", source: "a.mp4 at 0s" } };
    expect(getReferenceManifestProblems([createRow()], references)).toStrictEqual([]);
  });

  test("reports a row for an id the map does not name", () => {
    expect.hasAssertions();
    expect(getReferenceManifestProblems([createRow()], {})).toStrictEqual([
      `${ID} is in the manifest but not in the map`,
    ]);
  });

  test("reports a clean plate filled from other bytes than the entry's regions name", () => {
    expect.hasAssertions();
    const row = createRow({ cleanPlate: { bytes: 1, digest: DIGEST, height: SIZE, sha256: OTHER_HASH, width: SIZE } });
    expect(getReferenceManifestProblems([row], { [ID]: backdropReference })).toStrictEqual([
      `${ID} has a clean plate filled from other bytes or regions than its entry names`,
    ]);
  });

  test("accepts a clean plate whose digest is the entry's own", () => {
    expect.hasAssertions();
    const digest = getCleanPlateDigest(HASH, [REGION]);
    const row = createRow({ cleanPlate: { bytes: 1, digest, height: SIZE, sha256: OTHER_HASH, width: SIZE } });
    expect(getReferenceManifestProblems([row], { [ID]: backdropReference })).toStrictEqual([]);
  });
});
