import { parseJsonWithSchema } from "#src/services/exec/util/parseJsonWithSchema";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(parseJsonWithSchema, () => {
  // The shape every machine document this helper reads shares: a repo-relative path declared as a plain string
  // (overlay manifest entries, task cache plan entries, source mirror symlink targets).
  const pathSchema = z.object({ relativePath: z.string() });
  // A path that is itself a legal ISO datetime — a dumped log or export, a legal filename on Linux.
  const ISO_DATE_PATH = "2026-08-05T12:00:00Z";

  // A date reviver here would hand `z.string()` a Date and fail the read over one filename. On the write-back path
  // That throw lands after the command already ran, so the plan is never built and every file it wrote is lost.
  test("parses a path that looks like a datetime as the string the schema declares", () => {
    expect.hasAssertions();

    expect(
      parseJsonWithSchema(JSON.stringify({ relativePath: ISO_DATE_PATH }), pathSchema, parseJsonWithSchema.name),
    ).toStrictEqual({ relativePath: ISO_DATE_PATH });
  });

  test("throws an error named for the calling parser when the shape is wrong", () => {
    expect.hasAssertions();

    expect(() => parseJsonWithSchema(JSON.stringify({ relativePath: 0 }), pathSchema, parseJsonWithSchema.name))
      .toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: parseJsonWithSchema, ✖ Invalid input: expected string, received number
        → at relativePath]
    `);
  });
});
