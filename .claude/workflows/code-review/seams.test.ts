import { describe, expect, test } from "vitest";

import type { ScopeAnswer } from "./models/ScopeAnswer";

import { AREA_ARGS, AREA_SCOPE, CANDIDATE } from "./constants.test";
import { createAreaFiles } from "./createAreaFiles.test";
import { createSeam } from "./createSeam.test";
import { getPrompt } from "./getPrompt.test";
import { runReview } from "./runReview.test";
import { stubFor } from "./stubFor.test";

// The territory partition, and how an agent is pointed at the code it owns. A seam nobody could read still
// Printed its name in the log and in stats, which reads as a subsystem traced and found clean.
const areaScope = (overrides: ScopeAnswer): ScopeAnswer => ({
  ...AREA_SCOPE,
  files: createAreaFiles(),
  ...overrides,
});

describe("code-review seam partition", () => {
  // The sweep's own budget, the third cap the reportable ceiling has to account for.
  const SWEEP_CAP = 8;

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

  test("reports the fan-out that ran and budgets resolution off it, not off the lens angle count", async () => {
    expect.hasAssertions();

    // In seam mode no angle finder is spawned, so `ANGLES` describes a split that did not happen: publishing it
    // Understates a seam run's coverage by ~40%, and budgeting resolution off it gave the largest reviews — the
    // Ones seam mode exists for — the same six resolvers a two-file lens review gets, dropping the rest unexamined.
    const seams = [createSeam("reads", ["cache/f1.ts"]), createSeam("writes", ["cache/f2.ts"])];
    // Twelve unsettled findings, split across two finders because each one's own cap is six.
    const many = Array.from({ length: 12 }, (_, index) => ({ ...CANDIDATE, line: index + 1 }));
    const run = await runReview(
      AREA_ARGS,
      stubFor({
        finderFor: (label) =>
          label === "whole-area" ? many.slice(0, 6) : label.startsWith("seam:reads") ? many.slice(6) : [],
        resolution: { confidence: 95, evidence: "read the callee", verdict: "CONFIRMED" },
        scope: areaScope({ seams }),
        verdictFor: () => ({ confidence: 40 }),
      }),
    );
    const NON_FINDER_LABELS = new Set(["scope", "sweep", "synthesize"]);
    const finders = run.calls.filter(
      (call) =>
        !call.label.startsWith("verify:") && !call.label.startsWith("resolve:") && !NON_FINDER_LABELS.has(call.label),
    ).length;

    // Every finder but cleanup, and two resolvers apiece.
    expect(run.result.stats).toMatchObject({ angles: finders - 1, findMode: "seam" });
    expect(run.calls.filter((call) => call.label.startsWith("resolve:"))).toHaveLength((finders - 1) * 2);
  });

  test("gives two seams whose names share a long prefix separate finder identities", async () => {
    expect.hasAssertions();

    // The label is the finder's identity — `ingest` stamps it on every candidate and the dedupe counts distinct
    // Finders to decide whether a row is one agent's guess or several agreeing. Scope-agent seam names are
    // Descriptive phrases, so a truncated slug alone silently merges two seams into one finder.
    const shared = "the verdict pipeline and its";
    const seams = [
      createSeam(`${shared} verify phase`, ["cache/f1.ts"]),
      createSeam(`${shared} resolve phase`, ["cache/f2.ts"]),
    ];
    const run = await runReview(AREA_ARGS, stubFor({ scope: areaScope({ seams }) }));
    const seamLabels = run.calls.map((call) => call.label).filter((label) => label.startsWith("seam:"));

    expect(seamLabels).toHaveLength(2);
    expect(new Set(seamLabels).size).toBe(2);
  });

  test("publishes the ceiling it computed rather than a formula to reassemble", async () => {
    expect.hasAssertions();

    // Every term of the prose formula has drifted out of date at least once — the sweep's own cap was missing from
    // It for two levels — and a reader who re-derives it budgets for a run of a different size than they got.
    const high = (await runReview("high", stubFor({}))).result.stats;
    const xhigh = (await runReview("xhigh", stubFor({}))).result.stats;

    expect(high?.sweepCap).toBe(0);
    expect(high?.reportableCeiling).toBe((high?.angles ?? 0) * (high?.perAngle ?? 0) + (high?.cleanupCap ?? 0));
    expect(xhigh?.sweepCap).toBe(SWEEP_CAP);
    expect(xhigh?.reportableCeiling).toBe(
      (xhigh?.angles ?? 0) * (xhigh?.perAngle ?? 0) + (xhigh?.cleanupCap ?? 0) + SWEEP_CAP,
    );
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
    const seams = Array.from({ length: 8 }, (_, index) => createSeam(`s${index}`, [`cache/f${index}.ts`]));
    const run = await runReview(AREA_ARGS, stubFor({ scope: areaScope({ seams }) }));

    expect(run.logs).toContainEqual(expect.stringContaining("2 seam(s) past the level's cap of 6"));
    expect(run.logs).not.toContainEqual(expect.stringContaining("seam(s) dropped"));
  });

  test("never names cap-truncated seams on a run that fell back to lens", async () => {
    expect.hasAssertions();

    // The cap log's remedy is "raise the level", which buys nothing here: the partition was discarded wholesale,
    // So no seam got a finder and the file-count gate refuses the same fallback at every level.
    // Eight readable seams — past the level's cap of six — over a file set below the 25-file seam threshold.
    const seams = Array.from({ length: 8 }, (_, index) => createSeam(`s${index}`, [`cache/f${index}.ts`]));
    const run = await runReview(AREA_ARGS, stubFor({ scope: { ...AREA_SCOPE, files: createAreaFiles(8), seams } }));

    expect(run.result.stats).toMatchObject({ findMode: "lens" });
    expect(run.logs).not.toContainEqual(expect.stringContaining("seam(s) dropped"));
    expect(run.logs).not.toContainEqual(expect.stringContaining("past the level's cap"));
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
    ["two commands separated by a CRLF", "git diff main\r\ngit diff HEAD"],
    ["two commands separated by a bare carriage return", "git diff main\rgit diff HEAD"],
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
