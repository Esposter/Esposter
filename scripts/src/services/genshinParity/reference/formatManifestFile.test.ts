import type { ParityReferenceManifestRow } from "#src/models/genshinParity/reference/ParityReferenceManifestRow";

import { ParityReferenceKind } from "#src/models/genshinParity/reference/ParityReferenceKind";
import { formatManifestFile } from "#src/services/genshinParity/reference/formatManifestFile";
import { REFERENCE_MANIFEST_PATH } from "#src/services/genshinParity/shared/constants";
import { formatJsonFile } from "#src/services/shared/formatJsonFile";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { jsonDateParse } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(formatManifestFile, () => {
  const BYTES = 1;
  const HASH = "0".repeat(64);
  const EMPTY = { recordings: [], records: [], references: [] };
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

  test("is the formatter's own output, so formatting it again changes nothing", () => {
    expect.hasAssertions();

    const text = formatManifestFile({ ...EMPTY, gameVersion: "7.1.0", references: [createRow("a"), createRow("b")] });

    expect(formatJsonFile(REFERENCE_MANIFEST_PATH, jsonDateParse(text))).toBe(text);
  });

  test("sorts each section's rows, and leaves out a header key the manifest does not hold", () => {
    expect.hasAssertions();

    const text = formatManifestFile({ ...EMPTY, references: [createRow("b"), createRow("a")] });

    expect(text).toBe(formatManifestFile({ ...EMPTY, references: [createRow("a"), createRow("b")] }));
    expect(Object.keys(parseMachineJson(text))).not.toContain("animeGameDataCommit");
  });

  test("writes the sections in the order the committed file holds them", () => {
    expect.hasAssertions();

    expect(Object.keys(parseMachineJson(formatManifestFile(EMPTY)))).toStrictEqual([
      "records",
      "recordings",
      "references",
    ]);
  });
});
