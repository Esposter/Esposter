import { judgeAnimeStudioRun } from "#src/services/genshinAssets/shared/judgeAnimeStudioRun";
import { describe, expect, test } from "vitest";

describe(judgeAnimeStudioRun, () => {
  test("passes a clean exit", () => {
    expect.hasAssertions();

    expect(judgeAnimeStudioRun(0, "Processed 00/1.blk", "unused")).toBeUndefined();
  });

  test("fails a non-zero exit with the failure's own text", () => {
    expect.hasAssertions();

    expect(judgeAnimeStudioRun(1, "", "boom")?.message).toMatchInlineSnapshot(
      `"Invalid operation: Create, name: AnimeStudio, boom"`,
    );
  });

  test("fails a clean exit whose output names an exception, since AnimeStudio skipped what threw", () => {
    expect.hasAssertions();

    expect(judgeAnimeStudioRun(0, "[Error] System.NullReferenceException: at x", "unused")?.message)
      .toMatchInlineSnapshot(`
      "Invalid operation: Read, name: AnimeStudio, exited 0 but threw 1 exception(s), skipping what threw:
      [Error] System.NullReferenceException: at x"
    `);
  });
});
