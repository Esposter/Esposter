import type { OverlayEntry } from "@/models/exec/OverlayEntry";

import { FlushOpType } from "@/models/exec/FlushOp";
import { OverlayEntryKind } from "@/models/exec/OverlayEntryKind";
import { buildFlushPlan } from "@/services/exec/snapshot/buildFlushPlan";
import { NODE_MODULES_DIRECTORY } from "@/services/exec/test/constants.test";
import { describe, expect, test } from "vitest";

const never = (): boolean => false;
const isSnapshotLowerPath = (relativePath: string): boolean => relativePath.startsWith(`${NODE_MODULES_DIRECTORY}/`);

describe(buildFlushPlan, () => {
  test(`a ${OverlayEntryKind.Whiteout} becomes a single ${FlushOpType.Delete}`, () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [{ kind: OverlayEntryKind.Whiteout, relativePath: "a" }];

    expect(buildFlushPlan(entries, never)).toStrictEqual([{ relativePath: "a", type: FlushOpType.Delete }]);
  });

  test(`a ${OverlayEntryKind.Regular} entry becomes a single ${FlushOpType.Copy}`, () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [{ kind: OverlayEntryKind.Regular, relativePath: "a" }];

    expect(buildFlushPlan(entries, never)).toStrictEqual([{ relativePath: "a", type: FlushOpType.Copy }]);
  });

  test(`an ${OverlayEntryKind.OpaqueDir} expands to a ${FlushOpType.Delete} then a ${FlushOpType.Copy}`, () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [{ kind: OverlayEntryKind.OpaqueDir, relativePath: "a" }];

    expect(buildFlushPlan(entries, never)).toStrictEqual([
      { relativePath: "a", type: FlushOpType.Delete },
      { relativePath: "a", type: FlushOpType.Copy },
    ]);
  });

  test("a snapshot-lower path is skipped entirely", () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [
      { kind: OverlayEntryKind.Regular, relativePath: `${NODE_MODULES_DIRECTORY}/.vite/x` },
      { kind: OverlayEntryKind.Regular, relativePath: "a" },
    ];

    expect(buildFlushPlan(entries, isSnapshotLowerPath)).toStrictEqual([
      { relativePath: "a", type: FlushOpType.Copy },
    ]);
  });

  test("every delete runs before every copy", () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [
      { kind: OverlayEntryKind.Regular, relativePath: "a" },
      { kind: OverlayEntryKind.Whiteout, relativePath: "b" },
    ];

    expect(buildFlushPlan(entries, never)).toStrictEqual([
      { relativePath: "b", type: FlushOpType.Delete },
      { relativePath: "a", type: FlushOpType.Copy },
    ]);
  });

  test("copies are ordered parent-first so a directory exists before the files inside it", () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [
      { kind: OverlayEntryKind.Regular, relativePath: "a/b/c.txt" },
      { kind: OverlayEntryKind.Regular, relativePath: "a" },
      { kind: OverlayEntryKind.Regular, relativePath: "a/b" },
    ];

    expect(buildFlushPlan(entries, never)).toStrictEqual([
      { relativePath: "a", type: FlushOpType.Copy },
      { relativePath: "a/b", type: FlushOpType.Copy },
      { relativePath: "a/b/c.txt", type: FlushOpType.Copy },
    ]);
  });

  test("an opaque dir is cleared before its replacement children are copied in", () => {
    expect.hasAssertions();

    const entries: OverlayEntry[] = [
      { kind: OverlayEntryKind.OpaqueDir, relativePath: "a" },
      { kind: OverlayEntryKind.Regular, relativePath: "a/new.txt" },
    ];

    expect(buildFlushPlan(entries, never)).toStrictEqual([
      { relativePath: "a", type: FlushOpType.Delete },
      { relativePath: "a", type: FlushOpType.Copy },
      { relativePath: "a/new.txt", type: FlushOpType.Copy },
    ]);
  });
});
