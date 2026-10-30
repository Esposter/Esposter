import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";
import type { ParityReference } from "#src/models/genshinParity/shared/ParityReference";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { getReferenceManifestProblems } from "#src/services/genshinParity/reference/getReferenceManifestProblems";
import { describe, expect, test } from "vitest";

describe(getReferenceManifestProblems, () => {
  const ID = "a";
  const HASH = "0".repeat(64);
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
  const plateImage = { bytes: 1, height: SIZE, sha256: "1".repeat(64), width: SIZE };
  const plateReference: ParityReference = { plateSource: "a.mp4 at 1s", screen: "", source: "a.mp4 at 0s" };

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

  test("reports a plate source the row holds no plate for", () => {
    expect.hasAssertions();

    expect(getReferenceManifestProblems([createRow()], { [ID]: plateReference })).toStrictEqual([
      `${ID} names a plate source but has no plate`,
    ]);
  });

  test("reports a plate the entry names no source for", () => {
    expect.hasAssertions();

    const references: Record<string, ParityReference> = { [ID]: { screen: "", source: "a.mp4 at 0s" } };

    expect(getReferenceManifestProblems([createRow({ plate: plateImage })], references)).toStrictEqual([
      `${ID} has a plate its entry names no source for`,
    ]);
  });
});
