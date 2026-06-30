import type { OverlayManifestEntry } from "@/models/exec/OverlayManifestEntry";

import { parseOverlayManifest } from "@/services/exec/snapshot/parseOverlayManifest";
import { describe, expect, test } from "vitest";

describe(parseOverlayManifest, () => {
  const entry: OverlayManifestEntry = {
    isCharacterDevice: false,
    isDirectory: false,
    isOpaque: false,
    isSnapshotLowerPath: false,
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

    expect(() => parseOverlayManifest("not json")).toThrow(parseOverlayManifest.name);
  });

  test("throws when an entry is missing a field", () => {
    expect.hasAssertions();

    expect(() => parseOverlayManifest(JSON.stringify([{ relativePath: " " }]))).toThrow(parseOverlayManifest.name);
  });

  test("throws when a field has the wrong type", () => {
    expect.hasAssertions();

    expect(() => parseOverlayManifest(JSON.stringify([{ ...entry, rdev: "0" }]))).toThrow(parseOverlayManifest.name);
  });
});
