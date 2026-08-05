import { describe, expect, test } from "vitest";

import type { RunResult } from "./models/RunResult";

import { AREA_ARGS, AREA_SCOPE, CANDIDATE } from "./constants.test";
import { getPrompt } from "./getPrompt.test";
import { runReview } from "./runReview.test";
import { stubFor } from "./stubFor.test";

const getOptionsFor = (result: RunResult, label: string) => result.calls.find((call) => call.label === label)?.options;

// What a finder is asked for decides what it can report at all. Demanding a crash from a documentation finding
// Makes the finder either drop it or invent one, and neither outcome is visible anywhere in the output.
describe("code-review finder prompts", () => {
  const CRASH_DEMAND = "the user-visible consequence (error, wrong output, data loss)";
  const MIXED_WORDING = "never invent a crash for a documentation problem";

  test("asks a cleanup finder for a cost and never for a crash", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({}));

    expect(getPrompt(run, "cleanup")).toContain("the concrete cost");
    expect(getPrompt(run, "cleanup")).not.toContain(CRASH_DEMAND);
  });

  test("asks an area finder that can raise either kind for both wordings", async () => {
    expect.hasAssertions();

    const claims = [{ claim: "reads are single-flight", source: "docs/cache.md" }];
    const run = await runReview(AREA_ARGS, stubFor({ scope: { ...AREA_SCOPE, claims } }));

    expect(getPrompt(run, "conformance")).toContain(MIXED_WORDING);
    expect(getPrompt(run, "angle-A")).toContain(MIXED_WORDING);
  });

  test("asks the coverage finder only for the conclusion a reader would draw", async () => {
    expect.hasAssertions();

    const run = await runReview(AREA_ARGS, stubFor({ scope: AREA_SCOPE }));

    expect(getPrompt(run, "coverage")).toContain("the wrong conclusion a future reader or reviewer would draw");
    expect(getPrompt(run, "coverage")).not.toContain(MIXED_WORDING);
  });

  test("keeps the crash wording for a diff-mode correctness angle", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({}));

    expect(getPrompt(run, "angle-A")).toContain(CRASH_DEMAND);
  });

  test("substitutes the invariant angle into the deleted-code angle's slot", async () => {
    expect.hasAssertions();

    // Appended instead of substituted, `slice(0, angles)` cuts it at every level below max — so the highest
    // Value lens on standing code never runs on the default path.
    const run = await runReview(AREA_ARGS, stubFor({ scope: AREA_SCOPE }));
    const labels = run.calls.map((call) => call.label);

    expect(labels).toContain("angle-F");
    expect(labels).not.toContain("angle-B");
  });

  test("puts the materiality bar in front of every finder", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({}));

    expect(getPrompt(run, "angle-A")).toContain("Your cap is a ceiling, not a quota");
    expect(getPrompt(run, "cleanup")).toContain("Your cap is a ceiling, not a quota");
  });

  test("runs cleanup finders at low effort and correctness angles at the level's", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({}));
    const maxRun = await runReview("max", stubFor({}));

    expect(getOptionsFor(run, "cleanup")?.effort).toBe("low");
    expect(getOptionsFor(run, "angle-A")?.effort).toBe("high");
    // The level's second axis: without it `max` spawns the same agents as `xhigh` thinking exactly as hard, so a
    // Re-run after a capped round buys a wider skim rather than the deeper read the level was raised for.
    expect(getOptionsFor(maxRun, "angle-A")?.effort).toBe("max");
    expect(getOptionsFor(maxRun, "cleanup")?.effort).toBe("low");
  });

  test("tells the area sweep what the kinds mean, since its schema offers it the enum", async () => {
    expect.hasAssertions();

    // The sweep gets `kind` in area mode exactly as a finder does. Handed the enum with nothing explaining it, a
    // Candidate can self-label `cleanup` and demote its own defect into low-effort verification and a lower rank.
    const area = await runReview("area xhigh the cache", stubFor({ candidates: [CANDIDATE], scope: AREA_SCOPE }));
    const diff = await runReview("xhigh", stubFor({ candidates: [CANDIDATE] }));

    expect(getPrompt(area, "sweep")).toContain("Set each candidate's `kind`");
    expect(getPrompt(diff, "sweep")).not.toContain("Set each candidate's `kind`");
  });

  test("carries the record's settled decisions to finders and verifiers alike", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ candidates: [CANDIDATE] }));

    expect(getPrompt(run, "angle-A")).toContain("(the Scope pass found none)");
    expect(getPrompt(run, "verify:")).toContain("Recorded decisions");
  });

  test("omits from a verifier the file listing every finder carries", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ candidates: [CANDIDATE] }));

    expect(getPrompt(run, "angle-A")).toContain("Changed files (2)");
    expect(getPrompt(run, "verify:")).not.toContain("Changed files (2)");
  });

  test("hands a verifier the whole diff for a file the change never touched", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ candidates: [{ ...CANDIDATE, file: "untouched.ts" }] }));

    expect(getPrompt(run, "verify:")).toContain("is NOT in this change");
  });

  test("names the area's files beside an out-of-area one", async () => {
    expect.hasAssertions();

    // Angle C and the boundary block both produce candidates cited outside the area, and a verifier holding
    // Only the outside file has nothing to check the handoff against.
    const run = await runReview(
      AREA_ARGS,
      stubFor({ candidates: [{ ...CANDIDATE, file: "server/caller.ts" }], scope: AREA_SCOPE }),
    );

    expect(getPrompt(run, "verify:")).toContain("is NOT part of the audited area");
    expect(getPrompt(run, "verify:")).toContain("cache/a.ts");
  });
});
