import type { OverlayManifestEntry } from "#src/models/exec/snapshot/OverlayManifestEntry";

import { parseOverlayManifest } from "#src/services/exec/snapshot/parseOverlayManifest";
import { describe, expect, test } from "vitest";

describe(parseOverlayManifest, () => {
  const entry: OverlayManifestEntry = {
    checkIsSnapshotLowerPath: false,
    isCharacterDevice: false,
    isDirectory: false,
    isOpaque: false,
    rdev: 0,
    relativePath: "",
  };

  test("parses a valid manifest into typed records", () => {
    expect.hasAssertions();

    expect(parseOverlayManifest(JSON.stringify([entry]))).toStrictEqual([entry]);
  });

  test("parses an empty manifest", () => {
    expect.hasAssertions();

    expect(parseOverlayManifest("[]")).toStrictEqual([]);
  });

  test("throws on malformed JSON", () => {
    expect.hasAssertions();

    expect(() => parseOverlayManifest("not json")).toThrowErrorMatchingInlineSnapshot(`[InvalidOperationError: Invalid operation: Read, name: parseOverlayManifest, Unexpected token 'o', "not json" is not valid JSON]`);
  });

  test("throws when an entry is missing a field", () => {
    expect.hasAssertions();

    expect(() =>
      parseOverlayManifest(JSON.stringify([{ relativePath: " " }])),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: parseOverlayManifest, ✖ Invalid input: expected boolean, received undefined
        → at [0].isCharacterDevice
      ✖ Invalid input: expected boolean, received undefined
        → at [0].isDirectory
      ✖ Invalid input: expected boolean, received undefined
        → at [0].isOpaque
      ✖ Invalid input: expected boolean, received undefined
        → at [0].checkIsSnapshotLowerPath
      ✖ Invalid input: expected number, received undefined
        → at [0].rdev]
    `);
  });

  test("throws when a field has the wrong type", () => {
    expect.hasAssertions();

    expect(() =>
      parseOverlayManifest(JSON.stringify([{ ...entry, rdev: "0" }])),
    ).toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: parseOverlayManifest, ✖ Invalid input: expected number, received string
        → at [0].rdev]
    `);
  });
});
