import { FlushOpType } from "@/models/exec/FlushOp";
import { parseTaskCacheEntry } from "@/services/exec/cache/parseTaskCacheEntry";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { describe, expect, test } from "vitest";

describe(parseTaskCacheEntry, () => {
  const entry = {
    exitCode: 0,
    plan: [{ relativePath: TEST_FILENAME, type: FlushOpType.Copy }],
    stderr: "",
    stdout: " ",
  };

  test("parses a well-formed meta.json into a typed entry", () => {
    expect.hasAssertions();

    expect(parseTaskCacheEntry(JSON.stringify(entry))).toStrictEqual(entry);
  });

  test("throws on malformed JSON rather than replaying garbage", () => {
    expect.hasAssertions();

    expect(() => parseTaskCacheEntry("")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseTaskCacheEntry, Unexpected end of JSON input]`,
    );
  });

  test("throws when a flush op carries an unknown type", () => {
    expect.hasAssertions();

    const invalid = JSON.stringify({ ...entry, plan: [{ relativePath: TEST_FILENAME, type: " " }] });

    expect(() => parseTaskCacheEntry(invalid)).toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: parseTaskCacheEntry, ✖ Invalid option: expected one of "copy"|"delete"
        → at plan[0].type]
    `);
  });
});
