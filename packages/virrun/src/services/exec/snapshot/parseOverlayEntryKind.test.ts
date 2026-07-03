import { OverlayEntryKind } from "@/models/exec/snapshot/OverlayEntryKind";
import { parseOverlayEntryKind } from "@/services/exec/snapshot/parseOverlayEntryKind";
import { describe, expect, test } from "vitest";

describe(parseOverlayEntryKind, () => {
  test(`a character device with rdev 0:0 is a ${OverlayEntryKind.Whiteout}`, () => {
    expect.hasAssertions();

    expect(parseOverlayEntryKind({ isCharacterDevice: true, isDirectory: false, rdev: 0 }, false)).toBe(
      OverlayEntryKind.Whiteout,
    );
  });

  test(`a character device with a non-zero rdev is ${OverlayEntryKind.Regular} (a real device node, not a whiteout)`, () => {
    expect.hasAssertions();

    expect(parseOverlayEntryKind({ isCharacterDevice: true, isDirectory: false, rdev: 259 }, false)).toBe(
      OverlayEntryKind.Regular,
    );
  });

  test(`a directory carrying the opaque marker is an ${OverlayEntryKind.OpaqueDir}`, () => {
    expect.hasAssertions();

    expect(parseOverlayEntryKind({ isCharacterDevice: false, isDirectory: true, rdev: 0 }, true)).toBe(
      OverlayEntryKind.OpaqueDir,
    );
  });

  test(`a directory without the opaque marker is ${OverlayEntryKind.Regular} (a merge dir)`, () => {
    expect.hasAssertions();

    expect(parseOverlayEntryKind({ isCharacterDevice: false, isDirectory: true, rdev: 0 }, false)).toBe(
      OverlayEntryKind.Regular,
    );
  });

  test(`a regular file is ${OverlayEntryKind.Regular}`, () => {
    expect.hasAssertions();

    expect(parseOverlayEntryKind({ isCharacterDevice: false, isDirectory: false, rdev: 0 }, false)).toBe(
      OverlayEntryKind.Regular,
    );
  });

  test(`the opaque marker is ignored on a non-directory (a whiteout stays a ${OverlayEntryKind.Whiteout})`, () => {
    expect.hasAssertions();

    expect(parseOverlayEntryKind({ isCharacterDevice: true, isDirectory: false, rdev: 0 }, true)).toBe(
      OverlayEntryKind.Whiteout,
    );
  });
});
