import { describe, expect, test } from "vitest";

import type { Candidate } from "./models/Candidate";

import { AREA_ARGS, AREA_SCOPE, CANDIDATE, VERDICT_DEFAULT } from "./constants.test";
import { createCandidates } from "./createCandidates.test";
import { getFinding } from "./getFinding.test";
import { runReview } from "./runReview.test";
import { stubFor } from "./stubFor.test";

// Ingest and verification. The rule underneath all of it: a candidate nobody ruled on is dropped, never
// Reported as a verdict no agent gave.
describe("code-review verify", () => {
  test("normalises a candidate's path back onto the file the Scope agent named", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({ candidates: [{ ...CANDIDATE, file: "C:\\repo\\a.ts" }], scope: { files: ["a.ts", "util/a.ts"] } }),
    );

    expect(getFinding(run).file).toBe("a.ts");
  });

  test("truncates a finder at its cap and logs what it dropped", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ candidates: createCandidates(9) }));

    expect(run.logs).toContainEqual(expect.stringContaining("dropped 3 at cap 6 — coverage truncated"));
    expect(run.result.stats?.candidates).toBe(6);
    // A cause with no summary sentence still carries a stats field. This one was visible in the log alone, so a
    // Reader following "read the stats, never the prose" got a block that said nothing had been truncated.
    expect(run.result.stats?.droppedAtFinderCap).toBe(3);
  });

  test("caps the verifier fan-out by kind and says which files it left unjudged", async () => {
    expect.hasAssertions();

    // Grouping by file bounds nothing on its own: one candidate per file is the normal shape of a wide diff, and it
    // Degrades the phase holding most of a run's agents to one verifier per candidate.
    // Ten one-candidate files against `low`'s cap of eight. The ordering can only use `kind` — a finder is never
    // Asked for `severity` (`CANDIDATES_SCHEMA`), the verifier assigns it — so the two correctness candidates are
    // Returned LAST, where an unordered slice would cut them and keep eight convention nits instead.
    const files = Array.from({ length: 10 }, (_, index) => `f${index}.ts`);
    const CandidatesByFinder: Record<string, Candidate[]> = {
      "angle-A": createCandidates(4, (index) => ({ file: `f${index}.ts`, kind: "cleanup" })),
      "angle-F": createCandidates(4, (index) => ({ file: `f${index + 4}.ts`, kind: "cleanup" })),
      coverage: createCandidates(2, (index) => ({ file: `f${index + 8}.ts`, kind: "correctness" })),
    };
    const run = await runReview(
      "area low the cache",
      stubFor({
        finderFor: (label) => CandidatesByFinder[label] ?? [],
        scope: { ...AREA_SCOPE, files },
      }),
    );
    const verifiedFiles = run.calls
      .filter((call) => call.label.startsWith("verify:"))
      .map((call) => call.label)
      .toSorted((a, b) => a.localeCompare(b));

    // The two correctness files survive and two convention nits are cut, whatever order the finders returned in.
    expect(verifiedFiles).toStrictEqual([
      "verify:f0.ts(1) cleanup",
      "verify:f1.ts(1) cleanup",
      "verify:f2.ts(1) cleanup",
      "verify:f3.ts(1) cleanup",
      "verify:f4.ts(1) cleanup",
      "verify:f5.ts(1) cleanup",
      "verify:f8.ts(1)",
      "verify:f9.ts(1)",
    ]);
    // `droppedUnverified: 0` is the invariant, not a formality: fold the cap's drops into that counter and the two
    // Causes stop arguing opposite ways about the next round, which is the whole reason for a second field.
    expect(run.result.stats).toMatchObject({ droppedAtVerifyCap: 2, droppedUnverified: 0, verifyCeiling: 8 });
    // Named, not counted — which files went unexamined is what decides whether to re-run, and the cap's remedy
    // Differs from a dead verifier's, so it gets its own sentence rather than borrowing that one's.
    expect(run.result.summary).toContain("2 candidate(s) in f6.ts, f7.ts were dropped at the 8-verifier cap");
    expect(run.result.summary).toContain("narrow the window or raise the level");
  });

  test("honours a self-declared kind in area mode only", async () => {
    expect.hasAssertions();

    // In diff mode no prompt explains the kinds, so a self-label would let a correctness finder route its own
    // Defect into cheap verification and a demoted rank.
    const candidates = [{ ...CANDIDATE, kind: "cleanup" }];
    const area = await runReview(AREA_ARGS, stubFor({ candidates, scope: AREA_SCOPE }));
    const diff = await runReview("high", stubFor({ candidates }));

    expect(getFinding(area).kind).toBe("cleanup");
    expect(getFinding(diff).kind).toBe("correctness");
  });

  test("ignores a kind outside the enum", async () => {
    expect.hasAssertions();

    const run = await runReview(
      AREA_ARGS,
      stubFor({ candidates: [{ ...CANDIDATE, kind: "invented" }], scope: AREA_SCOPE }),
    );

    expect(getFinding(run).kind).toBe("correctness");
  });

  test("survives a finder that died", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({ finderFor: (label) => (label === "angle-A" ? null : label === "angle-B" ? [CANDIDATE] : []) }),
    );

    expect(run.result.findings).toHaveLength(1);
  });

  test("counts a finder that answered without candidates as a drop rather than ending the run", async () => {
    expect.hasAssertions();

    // The same schema drift the verifier path already survives, on the phase where it costs a whole lens or seam.
    // Unguarded, `r.candidates.length` throws inside the fan-out and takes down every other finder's completed work.
    const base = stubFor({ finderFor: (label) => (label === "angle-B" ? [CANDIDATE] : []) });
    const run = await runReview("high", (prompt, options) =>
      options.label === "angle-A" ? { note: "answered without a candidates array" } : base(prompt, options),
    );

    expect(run.result.stats?.droppedUnfound).toBe(1);
    expect(run.result.findings).toHaveLength(1);
  });

  test("names the finder whose territory went unread", async () => {
    expect.hasAssertions();

    // A dead finder that returns silently leaves a run missing a whole lens looking exactly like one that found
    // Nothing there — and the stop rule reads the second as converged.
    const run = await runReview(
      "high",
      stubFor({ finderFor: (label) => (label === "angle-A" ? null : label === "angle-B" ? [CANDIDATE] : []) }),
    );

    expect(run.result.stats?.droppedUnfound).toBe(1);
    expect(run.result.summary).toContain("1 finder(s) returned nothing usable (angle-A)");
  });

  test("drops a verdict entry that omitted its verdict rather than reporting an unjudged row", async () => {
    expect.hasAssertions();

    // Well-formed in every other field, so it clears the index check; `undefined` then clears the confidence gate
    // Too (the number is present and high) and lands on the row, printing `undefined 90%` to the reader.
    const base = stubFor({ candidates: [CANDIDATE] });
    const run = await runReview("high", (prompt, options) =>
      options.label?.startsWith("verify:")
        ? { verdicts: [{ index: 0, ...VERDICT_DEFAULT, confidence: 90 }] }
        : base(prompt, options),
    );

    expect(run.result.stats).toMatchObject({ droppedUnverified: 1, verified: 0 });
    expect(run.result.findings).toHaveLength(0);
  });

  test("counts a null verdict entry as a drop rather than losing the group silently", async () => {
    expect.hasAssertions();

    // Reading `v.index` off a null entry throws, and a throw here does not reach the counted-drop path: it kills
    // The thunk, `parallel` resolves it to null, and the `filter(Boolean)` backstop discards the whole group with
    // `droppedUnverified` still at zero — unexamined candidates reported as a clean file.
    const base = stubFor({ candidates: [CANDIDATE] });
    const run = await runReview("high", (prompt, options) =>
      options.label?.startsWith("verify:") ? { verdicts: [null] } : base(prompt, options),
    );

    expect(run.result.stats?.droppedUnverified).toBe(1);
    expect(run.result.findings).toHaveLength(0);
  });

  test("spawns one verifier per file, not per candidate", async () => {
    expect.hasAssertions();

    const candidates = [CANDIDATE, { ...CANDIDATE, line: 40 }, { ...CANDIDATE, file: "b.ts", line: 7 }];
    const run = await runReview("high", stubFor({ candidates }));

    expect(run.result.stats?.verifierAgents).toBe(2);
  });

  test("drops a candidate the verifier never ruled on rather than inventing a verdict", async () => {
    expect.hasAssertions();

    const base = stubFor({ candidates: [CANDIDATE, { ...CANDIDATE, line: 40 }] });
    const run = await runReview("high", (prompt, options) =>
      options.label?.startsWith("verify:")
        ? { verdicts: [{ index: 0, verdict: "CONFIRMED", ...VERDICT_DEFAULT }] }
        : base(prompt, options),
    );

    expect(run.result.stats).toMatchObject({ candidates: 2, verified: 1 });
  });

  test("discards a verdict whose index is out of range", async () => {
    expect.hasAssertions();

    const base = stubFor({ candidates: [CANDIDATE] });
    const run = await runReview("high", (prompt, options) =>
      options.label?.startsWith("verify:")
        ? { verdicts: [{ index: 7, verdict: "CONFIRMED", ...VERDICT_DEFAULT }] }
        : base(prompt, options),
    );

    expect(run.result.stats?.verified).toBe(0);
  });

  test("drops only that file's candidates when one verifier dies", async () => {
    expect.hasAssertions();

    const base = stubFor({ candidates: [CANDIDATE, { ...CANDIDATE, file: "b.ts" }] });
    const run = await runReview("high", (prompt, options) =>
      options.label?.startsWith("verify:a.ts") ? null : base(prompt, options),
    );

    expect(run.result.findings).toHaveLength(1);
    expect(getFinding(run).file).toBe("b.ts");
  });

  test("verifies a cleanup-only file at low effort", async () => {
    expect.hasAssertions();

    const run = await runReview(
      AREA_ARGS,
      stubFor({ candidates: [{ ...CANDIDATE, kind: "cleanup" }], scope: AREA_SCOPE }),
    );
    const verifier = run.calls.find((call) => call.label.startsWith("verify:"));

    expect(verifier?.options).toMatchObject({ effort: "low" });
    expect(verifier?.label).toContain("cleanup");
  });

  test("lets a verdict stand when the agent gave no confidence number, and reports no number for it", async () => {
    expect.hasAssertions();

    // A missing number reads as exactly the floor for the GATE, so schema drift never mass-downgrades a run — but
    // It is not written onto the finding: the reported percentage is the number the judging agent would defend, so
    // Materialising the floor prints a fabricated borderline figure and makes the report's "unrated" path dead.
    const run = await runReview(
      "high",
      stubFor({ candidates: [CANDIDATE], verdictFor: () => ({ confidence: undefined }) }),
    );

    expect(getFinding(run).verdict).toBe("CONFIRMED");
    expect(getFinding(run).confidence).toBeUndefined();
  });

  test("counts and names the candidates a dead verifier left unexamined", async () => {
    expect.hasAssertions();

    // Silently dropping them makes a degraded run indistinguishable from a clean one, and the stop rule reads
    // "no findings" as converged — so a session limit mid-verify would end a review with the reader told nothing.
    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE, { ...CANDIDATE, file: "b.ts" }],
        verifierFor: (label) => (label.startsWith("verify:a.ts") ? null : undefined),
      }),
    );

    expect(run.result.stats?.droppedUnverified).toBe(1);
    expect(run.result.summary).toContain("1 candidate(s) in a.ts reached no verdict at all");
  });

  test("counts a verifier that answered without verdicts as a drop rather than ending the run", async () => {
    expect.hasAssertions();

    // The schema requires the array, so this is schema drift — and drift must degrade into the counted drop the
    // Dead-agent path already produces, not throw inside the fan-out and take the whole run down with it.
    const base = stubFor({ candidates: [CANDIDATE, { ...CANDIDATE, file: "b.ts" }] });
    const run = await runReview("high", (prompt, options) =>
      options.label?.startsWith("verify:a.ts") ? {} : base(prompt, options),
    );

    expect(run.result.stats?.droppedUnverified).toBe(1);
    expect(getFinding(run).file).toBe("b.ts");
  });

  test.each([
    ["only at the levels that ask for it", "high", false],
    ["at xhigh", "xhigh", true],
  ])("sweeps %s", async (_case, args, isExpected) => {
    expect.hasAssertions();

    const run = await runReview(args, stubFor({ candidates: [CANDIDATE] }));

    expect(run.calls.map((call) => call.label).includes("sweep")).toBe(isExpected);
  });

  test("verifies what the sweep found and counts it", async () => {
    expect.hasAssertions();

    const base = stubFor({ candidates: [CANDIDATE] });
    const run = await runReview("xhigh", (prompt, options) =>
      options.label === "sweep" ? { candidates: [{ ...CANDIDATE, file: "b.ts", line: 9 }] } : base(prompt, options),
    );

    expect(run.result.stats?.candidates).toBe(2);
    expect(run.result.findings).toHaveLength(2);
  });
});
