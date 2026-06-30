import type { OverlayEntry } from "@/models/exec/OverlayEntry";

import { FlushOpType } from "@/models/exec/FlushOp";
import { OverlayEntryKind } from "@/models/exec/OverlayEntryKind";
import { buildFlushPlan } from "@/services/exec/snapshot/buildFlushPlan";
import { NODE_MODULES_DIRECTORY } from "@/services/exec/test/constants.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { describe, expect, test } from "vitest";

const never = (): boolean => false;
const isSnapshotLowerPath = (relativePath: string): boolean => relativePath.startsWith(`${NODE_MODULES_DIRECTORY}/`);

describe(buildFlushPlan, () => {
  test(`a ${OverlayEntryKind.Whiteout} becomes a single ${FlushOpType.Delete}`, () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [{ kind: OverlayEntryKind.Whiteout, relativePath: TEST_FILENAME }];

    expect(buildFlushPlan(entries, never)).toStrictEqual([{ relativePath: TEST_FILENAME, type: FlushOpType.Delete }]);
  });

  test(`a ${OverlayEntryKind.Regular} entry becomes a single ${FlushOpType.Copy}`, () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [{ kind: OverlayEntryKind.Regular, relativePath: TEST_FILENAME }];

    expect(buildFlushPlan(entries, never)).toStrictEqual([{ relativePath: TEST_FILENAME, type: FlushOpType.Copy }]);
  });

  test(`an ${OverlayEntryKind.OpaqueDir} expands to a ${FlushOpType.Delete} then a ${FlushOpType.Copy}`, () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [{ kind: OverlayEntryKind.OpaqueDir, relativePath: TEST_FILENAME }];

    expect(buildFlushPlan(entries, never)).toStrictEqual([
      { relativePath: TEST_FILENAME, type: FlushOpType.Delete },
      { relativePath: TEST_FILENAME, type: FlushOpType.Copy },
    ]);
  });

  test("a snapshot-lower path is skipped entirely", () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [
      { kind: OverlayEntryKind.Regular, relativePath: `${NODE_MODULES_DIRECTORY}/${TEST_FILENAME}` },
      { kind: OverlayEntryKind.Regular, relativePath: TEST_FILENAME },
    ];

    expect(buildFlushPlan(entries, isSnapshotLowerPath)).toStrictEqual([
      { relativePath: TEST_FILENAME, type: FlushOpType.Copy },
    ]);
  });

  test("every delete runs before every copy", () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [
      { kind: OverlayEntryKind.Regular, relativePath: TEST_FILENAME },
      { kind: OverlayEntryKind.Whiteout, relativePath: `${TEST_FILENAME}/${TEST_FILENAME}` },
    ];

    expect(buildFlushPlan(entries, never)).toStrictEqual([
      { relativePath: `${TEST_FILENAME}/${TEST_FILENAME}`, type: FlushOpType.Delete },
      { relativePath: TEST_FILENAME, type: FlushOpType.Copy },
    ]);
  });

  test("copies are ordered parent-first so a directory exists before the files inside it", () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [
      { kind: OverlayEntryKind.Regular, relativePath: `${TEST_FILENAME}/${TEST_FILENAME}/${TEST_FILENAME}` },
      { kind: OverlayEntryKind.Regular, relativePath: TEST_FILENAME },
      { kind: OverlayEntryKind.Regular, relativePath: `${TEST_FILENAME}/${TEST_FILENAME}` },
    ];

    expect(buildFlushPlan(entries, never)).toStrictEqual([
      { relativePath: TEST_FILENAME, type: FlushOpType.Copy },
      { relativePath: `${TEST_FILENAME}/${TEST_FILENAME}`, type: FlushOpType.Copy },
      { relativePath: `${TEST_FILENAME}/${TEST_FILENAME}/${TEST_FILENAME}`, type: FlushOpType.Copy },
    ]);
  });

  test("an opaque dir is cleared before its replacement children are copied in", () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [
      { kind: OverlayEntryKind.OpaqueDir, relativePath: TEST_FILENAME },
      { kind: OverlayEntryKind.Regular, relativePath: `${TEST_FILENAME}/${TEST_FILENAME}` },
    ];

    expect(buildFlushPlan(entries, never)).toStrictEqual([
      { relativePath: TEST_FILENAME, type: FlushOpType.Delete },
      { relativePath: TEST_FILENAME, type: FlushOpType.Copy },
      { relativePath: `${TEST_FILENAME}/${TEST_FILENAME}`, type: FlushOpType.Copy },
    ]);
  });
});
