import { SourceMirrorEntryType } from "@/models/exec/wsl/SourceMirrorEntryType";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME } from "@/services/exec/wsl/constants";
import { readSourceMirrorManifest } from "@/services/exec/wsl/readSourceMirrorManifest";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const state = vi.hoisted(() => ({ entryUnc: "" }));

vi.mock(import("@/services/exec/wsl/getWslSourceMirrorEntryUnc"), () => ({
  getWslSourceMirrorEntryUnc: () => state.entryUnc,
}));

describe(readSourceMirrorManifest, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();

  beforeEach(() => {
    state.entryUnc = create();
  });

  afterEach(cleanup);

  test("round-trips a published manifest", () => {
    expect.hasAssertions();

    const manifest = { [TEST_FILENAME]: { mtimeMs: 1, size: 1, target: "", type: SourceMirrorEntryType.File } };
    writeFileSync(join(state.entryUnc, VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME), JSON.stringify(manifest));

    expect(readSourceMirrorManifest(TEST_FILENAME)).toStrictEqual(manifest);
  });

  test("returns undefined when no manifest has been published", () => {
    expect.hasAssertions();

    expect(readSourceMirrorManifest(TEST_FILENAME)).toBeUndefined();
  });

  test("returns undefined for a torn or schema-drifted file instead of a delta computed from garbage", () => {
    expect.hasAssertions();

    const manifestPath = join(state.entryUnc, VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME);
    writeFileSync(manifestPath, "{");

    expect(readSourceMirrorManifest(TEST_FILENAME)).toBeUndefined();

    writeFileSync(manifestPath, JSON.stringify({ [TEST_FILENAME]: { type: TEST_FILENAME } }));

    expect(readSourceMirrorManifest(TEST_FILENAME)).toBeUndefined();
  });
});
