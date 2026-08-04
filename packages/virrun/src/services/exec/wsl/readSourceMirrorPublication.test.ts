import { SourceMirrorEntryType } from "@/models/exec/wsl/SourceMirrorEntryType";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { NODE_MODULES_DIRECTORY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME } from "@/services/exec/wsl/constants";
import { readSourceMirrorPublication } from "@/services/exec/wsl/readSourceMirrorPublication";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const state = vi.hoisted(() => ({ entryUnc: "" }));

vi.mock(import("@/services/exec/wsl/getWslSourceMirrorEntryUnc"), () => ({
  getWslSourceMirrorEntryUnc: () => state.entryUnc,
}));

describe(readSourceMirrorPublication, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const entries = { [TEST_FILENAME]: { mtimeMs: 1, size: 1, target: "", type: SourceMirrorEntryType.File } };
  const write = (data: unknown): void => {
    writeFileSync(join(state.entryUnc, VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME), JSON.stringify(data));
  };

  beforeEach(() => {
    state.entryUnc = create();
  });

  afterEach(cleanup);

  test("round-trips a published tree state together with the exclude set it was walked under", () => {
    expect.hasAssertions();

    const publication = { entries, excludes: [NODE_MODULES_DIRECTORY] };
    write(publication);

    expect(readSourceMirrorPublication(TEST_FILENAME)).toStrictEqual(publication);
  });

  test("returns undefined when no manifest has been published", () => {
    expect.hasAssertions();

    expect(readSourceMirrorPublication(TEST_FILENAME)).toBeUndefined();
  });

  test("returns undefined for a torn or schema-drifted file instead of a delta computed from garbage", () => {
    expect.hasAssertions();

    writeFileSync(join(state.entryUnc, VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME), "{");

    expect(readSourceMirrorPublication(TEST_FILENAME)).toBeUndefined();

    write({ entries: { [TEST_FILENAME]: { type: TEST_FILENAME } }, excludes: [] });

    expect(readSourceMirrorPublication(TEST_FILENAME)).toBeUndefined();
  });

  // Every mirror published before the exclude set was recorded holds this shape, and each one may be carrying copies
  // Of paths a since-added exclude now forbids — rejecting it is what routes them into the clearing full materialize.
  test("rejects a manifest that records no exclude set, so a pre-publication mirror rebuilds once", () => {
    expect.hasAssertions();

    write(entries);

    expect(readSourceMirrorPublication(TEST_FILENAME)).toBeUndefined();
  });
});
