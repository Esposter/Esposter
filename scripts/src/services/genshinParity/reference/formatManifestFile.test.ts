import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { formatManifestFile } from "#src/services/genshinParity/reference/formatManifestFile";
import { describe, expect, test } from "vitest";

describe(formatManifestFile, () => {
  const BYTES = 1;
  const HASH = "0".repeat(64);
  const EMPTY = { records: [], recordings: [], references: [] };
  const createRow = (id: string): ParityReferenceManifestRow => ({
    attribution: {},
    bytes: BYTES,
    capturedAt: new Date(0).toISOString(),
    height: BYTES,
    id,
    kind: ParityReferenceKind.Other,
    sha256: HASH,
    sourceFormat: "png",
    width: BYTES,
  });

  test("leaves a header key out when the manifest does not know it", () => {
    expect.hasAssertions();
    expect(formatManifestFile(EMPTY).split("\n")).toStrictEqual([
      "{",
      '  "records": [],',
      '  "recordings": [],',
      '  "references": []',
      "}",
      "",
    ]);
  });

  test("writes the known header, then one row per line in id order", () => {
    expect.hasAssertions();
    const lines = formatManifestFile({
      ...EMPTY,
      gameVersion: "7.1.0",
      references: [createRow("b"), createRow("a")],
    }).split("\n");
    expect(lines).toHaveLength(10);
    expect(lines[1]).toBe('  "gameVersion": "7.1.0",');
    expect(lines[5]).toContain('"id":"a"');
    expect(lines[6]).toContain('"id":"b"');
  });
});
