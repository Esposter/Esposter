import { describe, expect, test } from "vitest";

import { AREA_ARGS, AREA_SCOPE, CANDIDATE } from "./constants.test";
import { createAreaFiles } from "./createAreaFiles.test";
import { createSeam } from "./createSeam.test";
import { getPrompt } from "./getPrompt.test";
import { runReview } from "./runReview.test";
import { stubFor } from "./stubFor.test";

// The territory partition, and how an agent is pointed at the code it owns. A seam nobody could read still
// Printed its name in the log and in stats, which reads as a subsystem traced and found clean.
describe("code-review seam partition", () => {
  const areaScope = (overrides: Record<string, unknown>) => ({ ...AREA_SCOPE, files: createAreaFiles(), ...overrides });

  test("splits a large area by seam and adds the whole-territory safety net", async () => {
    expect.hasAssertions();

    const run = await runReview(
      AREA_ARGS,
      stubFor({
        scope: areaScope({ seams: [createSeam("reads", ["cache/f1.ts"]), createSeam("writes", ["cache/f2.ts"])] }),
      }),
    );

    expect(run.result.stats).toMatchObject({ findMode: "seam", seams: ["reads", "writes"] });
    expect(run.calls.map((call) => call.label)).toContain("whole-area");
  });

  test("falls back to lens when only one seam is usable", async () => {
    expect.hasAssertions();

    const run = await runReview(
      AREA_ARGS,
      stubFor({
        scope: areaScope({ seams: [createSeam("real", ["cache/f1.ts"]), createSeam("ghost", ["cache/**/*.ts"])] }),
      }),
    );

    expect(run.logs).toContainEqual(expect.stringContaining("1 seam(s) dropped"));
    expect(run.logs).toContainEqual(expect.stringContaining("seam partition unusable, fell back"));
    expect(run.result.stats).toMatchObject({ findMode: "lens" });
  });

  test("ignores a seam with no name", async () => {
    expect.hasAssertions();

    const seams = [createSeam("reads", ["cache/f1.ts"]), createSeam("writes", ["cache/f2.ts"]), createSeam("", ["c"])];
    const run = await runReview(AREA_ARGS, stubFor({ scope: areaScope({ seams }) }));

    expect(run.result.stats?.seams).toStrictEqual(["reads", "writes"]);
  });

  test("names cap-truncated seams separately from unreadable ones", async () => {
    expect.hasAssertions();

    // One message for both blames the wrong cause: a capped seam's prefixes resolved fine, the level could not
    // Spawn that many finders, and the remedy is a different one.
    const seams = Array.from({ length: 8 }, (_, index) => createSeam("s" + index, ["cache/f" + index + ".ts"]));
    const run = await runReview(AREA_ARGS, stubFor({ scope: areaScope({ seams }) }));

    expect(run.logs).toContainEqual(expect.stringContaining("2 seam(s) past the level's cap of 6"));
    expect(run.logs).not.toContainEqual(expect.stringContaining("seam(s) dropped"));
  });

  test("gives a seam a boundary block only when its neighbours are readable", async () => {
    expect.hasAssertions();

    const seams = [
      createSeam("reads", ["cache/f1.ts"], ["cache/f2.ts"]),
      createSeam("writes", ["cache/f2.ts"], ["cache/**/*.ts"]),
    ];
    const run = await runReview(AREA_ARGS, stubFor({ scope: areaScope({ seams }) }));

    expect(getPrompt(run, "seam:reads")).toContain("### Your boundary");
    expect(getPrompt(run, "seam:writes")).not.toContain("### Your boundary");
    expect(run.logs).toContainEqual(expect.stringContaining("1 seam(s) got no boundary check"));
  });

  test("resolves an area seam's prefixes to the files in scope", async () => {
    expect.hasAssertions();

    const seams = [createSeam("reads", ["cache/"]), createSeam("writes", ["cache/f2.ts"])];
    const run = await runReview(AREA_ARGS, stubFor({ scope: areaScope({ seams }) }));

    expect(getPrompt(run, "seam:reads")).toContain("Read these paths in full");
    expect(getPrompt(run, "seam:reads")).toContain("cache/f0.ts");
  });

  test.each([
    ["a command that already carries a pathspec", "git diff main -- src"],
    ["a trailing double dash", "git diff main --"],
    ["two commands joined with &&", "git diff main && git diff HEAD"],
    ["two commands joined with a semicolon", "git diff main; git diff HEAD"],
    ["two commands on separate lines", "git diff main\ngit diff HEAD"],
  ])("does not append a pathspec to %s", async (_case, diffCommand) => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ candidates: [CANDIDATE], scope: { diffCommand } }));

    expect(getPrompt(run, "verify:")).toContain("could not be narrowed safely");
  });

  test("narrows a plain diff command with a quoted pathspec", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ candidates: [CANDIDATE] }));

    expect(getPrompt(run, "verify:")).toContain("git diff main...HEAD -- 'a.ts'");
  });
});
