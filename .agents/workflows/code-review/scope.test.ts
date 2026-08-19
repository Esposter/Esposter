import { describe, expect, test } from "vitest";

import { AREA_ARGS, AREA_SCOPE } from "./constants.test";
import { createAreaFiles } from "./createAreaFiles.test";
import { getPrompt } from "./getPrompt.test";
import { runReview } from "./runReview.test";
import { stubFor } from "./stubFor.test";

// What each agent is told exists to review, and what the run is allowed to spend reading it.
describe("code-review scope sizing", () => {
  test("collapses generated and binary files to a count", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({ scope: { files: ["a.ts", "pnpm-lock.yaml", "icon.png", "x.snap"] } }),
    );

    expect(getPrompt(run, "angle-A")).toContain("plus 3 generated or binary files");
    expect(getPrompt(run, "angle-A")).not.toContain("pnpm-lock.yaml");
  });

  test("lists the files anyway when every one of them is generated", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ scope: { files: ["pnpm-lock.yaml"] } }));

    expect(getPrompt(run, "angle-A")).toContain("pnpm-lock.yaml");
  });

  test("caps an over-broad area at 120 files, source first, and logs the drop", async () => {
    expect.hasAssertions();

    const run = await runReview(
      AREA_ARGS,
      stubFor({ scope: { ...AREA_SCOPE, files: ["lock.snap", ...createAreaFiles(200)] } }),
    );

    expect(run.logs).toContainEqual(expect.stringContaining("Scope resolved 201 files — capped at 120, 81 dropped"));
    // The discriminating half: a non-source file is never listed individually anyway, so `not.toContain` passes
    // With or without the ordering. What "source first" buys is that a source file BELOW the drop line survives —
    // Capping without it spends the 120-file budget on lockfiles and snapshots while the log reads identically.
    expect(getPrompt(run, "angle-A")).toContain("cache/f119.ts");
    expect(getPrompt(run, "angle-A")).not.toContain("lock.snap");
  });

  test("never caps a diff, however large", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ scope: { files: createAreaFiles(200) } }));

    expect(run.logs).not.toContainEqual(expect.stringContaining("capped at"));
  });

  test("trims the fan-out on a small territory", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ scope: { changedLines: 120, files: ["a.ts"] } }));

    expect(run.logs).toContainEqual(expect.stringContaining("small territory (120 lines)"));
    expect(run.result.stats).toMatchObject({ angles: 2, perAngle: 4 });
  });

  test.each([
    ["a Scope agent that reported no size", { changedLines: undefined }],
    ["a small line count spread over many files", { changedLines: 120, files: createAreaFiles(12) }],
  ])("keeps the level's fan-out for %s", async (_case, scope) => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ scope }));

    expect(run.result.stats).toMatchObject({ angles: 3, perAngle: 6 });
  });

  test("derives every finder cap from the fan-out actually run", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ scope: { changedLines: 100, files: ["a.ts"] } }));

    expect(getPrompt(run, "angle-A")).toContain("Surface up to 4 candidate findings");
    // The conventions finder gets ONE candidate per correctness angle, never the correctness total its
    // Five-lens predecessor carried — that budget made it half of a lens run's candidates and half of its
    // Verifier fan-out, for findings that are minor by definition.
    expect(getPrompt(run, "conventions")).toContain("Surface up to 2 candidate findings");
  });
});
