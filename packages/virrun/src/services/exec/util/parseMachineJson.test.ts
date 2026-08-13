import { parseMachineJson } from "@/services/exec/util/parseMachineJson";
import { describe, expect, test } from "vitest";
// A repo-relative path that is itself a legal ISO datetime — a dumped log or export, a legal filename on Linux.
const ISO_DATE_PATH = "2026-08-05T12:00:00Z";

describe(parseMachineJson, () => {
  // The whole reason this parse exists: every string in a machine document is a path, a symlink target or an exclude
  // Pattern, so reviving one that happens to look like a datetime hands the reading schema a Date where it declared a
  // String — and the read fails over a filename.
  test("leaves a path-valued string that looks like a datetime a string", () => {
    expect.hasAssertions();

    expect(parseMachineJson(JSON.stringify({ relativePath: ISO_DATE_PATH }))).toStrictEqual({
      relativePath: ISO_DATE_PATH,
    });
  });

  test("throws on malformed json so the caller can diagnose the read", () => {
    expect.hasAssertions();

    expect(() => parseMachineJson("{")).toThrowErrorMatchingInlineSnapshot(
      `[SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2)]`,
    );
  });
});
