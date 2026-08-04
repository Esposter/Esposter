import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

import { AREA_ARGS, AREA_SCOPE, CANDIDATE } from "./constants.test";
import { getPrompt } from "./getPrompt.test";
import { runReview } from "./runReview.test";
import { stubFor } from "./stubFor.test";

// Every test here pins a decision the argument parse or the entry guards already got wrong once.
describe("code-review entry", () => {
  test.each([
    ["", "diff", "high", ""],
    ["high", "diff", "high", ""],
    ["diff xhigh", "diff", "xhigh", ""],
    ["area high packages/x", "area", "high", "packages/x"],
    ["xhigh 812", "diff", "xhigh", "812"],
    // A diff target is free-form English, so a leading mode word only switches modes when a level follows it —
    // Otherwise "area of message deletion that PR 812 touched" buys a whole-subsystem audit nobody asked for.
    ["area of message deletion that PR 812 touched", "diff", "high", "area of message deletion that PR 812 touched"],
    // Own-property check: an Object.prototype key must never parse as a level.
    ["constructor 812", "diff", "high", "constructor 812"],
  ])("parses %j as %s at %s", async (args, mode, level, target) => {
    expect.hasAssertions();

    const run = await runReview(args, stubFor({}));

    expect(takeOne(run.logs)).toBe(
      `${mode} mode, ${level} effort, target: ${target ? `"${target}"` : "(the working diff)"}`,
    );
    expect(run.result.stats).toMatchObject({ level, mode });
  });

  // The whole-args clause of the mode parse: without it "area" alone parses as a diff review whose TARGET is the
  // Literal string "area", and the user who asked for a subsystem audit gets a working-tree diff review with no
  // Error at all. Every other row in the table above supplies a level word or free-form English, so the clause is
  // Unpinned by them.
  test("refuses a bare mode word with no target", async () => {
    expect.hasAssertions();

    const run = await runReview("area", stubFor({}));

    expect(run.result.error).toContain("Area mode needs a target");
    expect(run.calls).toHaveLength(0);
  });

  test("probes without spawning an agent", async () => {
    expect.hasAssertions();

    const run = await runReview("probe", stubFor({}));

    expect(run.result).toStrictEqual({ probe: true });
    expect(run.calls).toHaveLength(0);
  });

  test("refuses an area review with no target", async () => {
    expect.hasAssertions();

    const run = await runReview("area high", stubFor({}));

    expect(run.result.error).toContain("Area mode needs a target");
    expect(run.calls).toHaveLength(0);
  });

  test("hands a multi-line target down verbatim", async () => {
    expect.hasAssertions();

    // Tokenising and re-joining collapses a pasted skip list into one run-on directive; the parse slices.
    const target = "review src/x.ts\nskip generated output";
    const run = await runReview(`high ${target}`, stubFor({ candidates: [CANDIDATE] }));

    expect(getPrompt(run, "scope")).toContain(target);
    expect(getPrompt(run, "angle-A")).toContain(target);
  });

  test("pins every agent to opus rather than inheriting the session model", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ candidates: [CANDIDATE] }));

    expect(run.calls.length).toBeGreaterThan(3);
    expect(run.calls.every((call) => call.options.model === "opus")).toBe(true);
  });

  test("stops when the Scope agent returns nothing", async () => {
    expect.hasAssertions();

    const run = await runReview("high", () => null);

    expect(run.result.error).toContain("Scope agent returned no result");
  });

  test.each([
    ["high", "No changes found to review."],
    [AREA_ARGS, "The target did not resolve to any files to review."],
  ])("reports an empty scope for %j", async (args, summary) => {
    expect.hasAssertions();

    const run = await runReview(args, stubFor({ scope: { files: [] } }));

    expect(run.result.summary).toBe(summary);
    expect(run.result.findings).toHaveLength(0);
  });

  test("emits one stats shape whether the run ended early or ran to completion", async () => {
    expect.hasAssertions();

    const empty = await runReview("high", stubFor({ scope: { files: [] } }));
    const full = await runReview("high", stubFor({ candidates: [CANDIDATE] }));

    const keys = Object.keys(full.result.stats ?? {}).toSorted();

    // Without this, a run that dropped the stats block entirely compares two empty key lists and passes.
    expect(keys.length).toBeGreaterThan(0);
    expect(Object.keys(empty.result.stats ?? {}).toSorted()).toStrictEqual(keys);
  });

  test("requires a diff command in diff mode and not in area mode", async () => {
    expect.hasAssertions();

    const diff = await runReview("high", stubFor({}));
    const area = await runReview(AREA_ARGS, stubFor({ scope: AREA_SCOPE }));

    expect(takeOne(diff.calls).options.schema?.required).toStrictEqual(["diffCommand", "files", "summary"]);
    expect(takeOne(area.calls).options.schema?.required).toStrictEqual(["files", "summary"]);
  });

  test("asks for a seam partition only above the diff-mode file threshold", async () => {
    expect.hasAssertions();

    const diff = await runReview("high", stubFor({}));
    // An area review has no diff to size, so its partition is unconditional — asking for it above a changed-file
    // Count there would leave every small area unpartitioned by territory.
    const area = await runReview(AREA_ARGS, stubFor({ scope: AREA_SCOPE }));

    expect(getPrompt(diff, "scope")).toContain("at least 50 files");
    expect(getPrompt(area, "scope")).not.toContain("at least 50 files");
    expect(getPrompt(area, "scope")).toContain("Return seams whenever the area holds more than one coherent");
  });
});
