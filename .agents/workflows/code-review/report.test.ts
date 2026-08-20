import { describe, expect, test } from "vitest";

import { AREA_ARGS, AREA_SCOPE, CANDIDATE } from "./constants.test";
import { getFinding } from "./getFinding.test";
import { runReview } from "./runReview.test";
import { stubFor } from "./stubFor.test";

// Ranking, merging and the returned shape. Every rule here exists because the report is the only part of a run
// The user sees: a row that overstates its verdict, loses a deliverable, or omits what was dropped is the defect.
describe("code-review report", () => {
  const SECOND_LINE = { ...CANDIDATE, line: 9, summary: "Same cause, other line" };
  const MERGE_ONE = { decisions: [{ index: 0, merge: [1], shortSummary: "One cause" }], summary: "merged" };

  test("ranks a critical correctness finding above a minor cleanup one", async () => {
    expect.hasAssertions();

    const run = await runReview(
      AREA_ARGS,
      stubFor({
        candidates: [
          { ...CANDIDATE, kind: "cleanup", line: 1, summary: "Duplicated helper" },
          { ...CANDIDATE, kind: "correctness", line: 2, summary: "Write is dropped" },
        ],
        scope: AREA_SCOPE,
        verdictFor: (index) => ({ severity: index === 1 ? "critical" : "minor" }),
      }),
    );

    expect(getFinding(run).summary).toContain("Write is dropped");
  });

  test("treats an unrated severity as major", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({ candidates: [CANDIDATE], verdictFor: () => ({ severity: undefined }) }),
    );

    expect(getFinding(run).severity).toBe("major");
  });

  test("appends every finding the synthesizer left out", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE, { ...SECOND_LINE, summary: "Second defect" }],
        synthesis: { decisions: [{ index: 0, shortSummary: "First" }], summary: "one finding" },
      }),
    );

    expect(run.result.findings).toHaveLength(2);
    expect(run.result.summary).toContain("1 additional verified finding appended unmerged");
  });

  test("prefers the synthesizer's short summary and derives one otherwise", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE, { ...SECOND_LINE, summary: "Second defect; with a clause" }],
        synthesis: { decisions: [{ index: 0, shortSummary: "Chosen wording" }], summary: "two findings" },
      }),
    );

    expect(getFinding(run).shortSummary).toBe("Chosen wording");
    expect(getFinding(run, 1).shortSummary).toBe("Second defect");
  });

  test.each([
    ["a decimal", "Cache TTL of 0.5s is ignored", "Cache TTL of 0.5s is ignored"],
    ["a colon", "canonFile: returns the raw path", "canonFile: returns the raw path"],
    ["a clause boundary", "Write drops the entity — the failure path skips it", "Write drops the entity"],
    [
      "an over-long first clause",
      "A very long single clause that keeps going well past the sixty character budget",
      "A very long single clause that keeps going well past the…",
    ],
  ])("derives a short summary across %s", async (_case, summary, expected) => {
    expect.hasAssertions();

    // Rendered verbatim as the finding's whole claim, so a fragment asserting a value the code does not have is
    // Worse than a long row.
    const run = await runReview("high", stubFor({ candidates: [{ ...CANDIDATE, summary }] }));

    expect(getFinding(run).shortSummary).toBe(expected);
  });

  test("keeps a clipped short summary inside its budget, ellipsis included", async () => {
    expect.hasAssertions();

    // An unbroken clause takes the no-word-boundary branch, where appending the ellipsis past the cut returned one
    // Character over the width the column's whole contract is.
    const run = await runReview("high", stubFor({ candidates: [{ ...CANDIDATE, summary: "A".repeat(90) }] }));

    expect(getFinding(run).shortSummary).toHaveLength(60);
  });

  test("reports corroboration and merged locations as fields, not only as summary text", async () => {
    expect.hasAssertions();

    // The report format renders `shortSummary` verbatim and forbids substituting `summary`, so a label that lives
    // Only in `summary` is unreachable — the reader cannot tell one finder's guess from several agreeing.
    const run = await runReview(
      "high",
      stubFor({
        finderFor: (label) => (label === "angle-A" || label === "angle-B" ? [CANDIDATE] : [SECOND_LINE]),
        synthesis: MERGE_ONE,
      }),
    );

    expect(getFinding(run).corroboration).toBe(2);
    expect(getFinding(run).alsoAt).toStrictEqual(["a.ts:9"]);
  });

  test("falls back to a stated summary when the synthesizer's decisions are unusable", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({ candidates: [CANDIDATE], synthesis: { decisions: [{ index: 42 }], summary: "unusable" } }),
    );

    expect(run.result.summary).toContain("Synthesis step was skipped or its decisions were unusable");
  });

  test("merges a root cause across lines and cites where else it shows up", async () => {
    expect.hasAssertions();

    const run = await runReview("high", stubFor({ candidates: [CANDIDATE, SECOND_LINE], synthesis: MERGE_ONE }));

    expect(run.result.findings).toHaveLength(1);
    expect(getFinding(run).summary).toContain("[same root cause also at: a.ts:9]");
  });

  test("escalates a merged group to its worst verdict and severity", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE, SECOND_LINE],
        synthesis: MERGE_ONE,
        verdictFor: (index) =>
          index === 0 ? { confidence: 72, verdict: "CONFIRMED" } : { confidence: 95, severity: "critical" },
      }),
    );

    expect(getFinding(run).severity).toBe("critical");
    expect(getFinding(run).verdict).toBe("CONFIRMED");
  });

  test("reads a group's confidence off a member that reached the reported verdict", async () => {
    expect.hasAssertions();

    // A member holding a different verdict is confident about a different claim, so its number would print a
    // Figure no agent would defend on the column the reader uses to decide whether a fix rests on a read line.
    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE, SECOND_LINE],
        resolution: null,
        synthesis: MERGE_ONE,
        verdictFor: (index) => ({
          confidence: index === 0 ? 72 : 40,
          verdict: index === 0 ? "CONFIRMED" : "PLAUSIBLE",
        }),
      }),
    );

    expect(getFinding(run).confidence).toBe(72);
  });

  test("takes a finding's provenance label and its citation off the same member", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE, SECOND_LINE],
        synthesis: MERGE_ONE,
        verdictFor: (index) =>
          index === 0
            ? { provenance: "new", provenanceSource: "" }
            : { provenance: "regression", provenanceSource: "abc1234" },
      }),
    );

    expect(getFinding(run).provenance).toBe("regression");
    expect(getFinding(run).provenanceSource).toBe("abc1234");
  });

  test("clears the blocker once a merged member settles the group", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE, SECOND_LINE],
        resolution: { blocker: "the deployed value", confidence: 80, evidence: "not here", verdict: "UNRESOLVABLE" },
        synthesis: MERGE_ONE,
        verdictFor: (index) => ({ confidence: index === 0 ? 40 : 95 }),
      }),
    );

    expect(getFinding(run).verdict).toBe("CONFIRMED");
    expect(getFinding(run).unresolvedBlocker).toBeUndefined();
  });

  test("reports an unsettleable finding even when its resolver named no blocker", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE],
        resolution: { confidence: 80, evidence: "needs the deployed value", verdict: "UNRESOLVABLE" },
        verdictFor: () => ({ confidence: 40 }),
      }),
    );

    expect(getFinding(run).unresolvedBlocker).toBe("the resolver named no blocker");
  });

  test("carries the resolver's blocker through to the report", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE],
        resolution: {
          blocker: "the deployed MAX_UPLOAD_BYTES",
          confidence: 80,
          evidence: "not in the repo",
          verdict: "UNRESOLVABLE",
        },
        verdictFor: () => ({ confidence: 40 }),
      }),
    );

    expect(getFinding(run).unresolvedBlocker).toBe("the deployed MAX_UPLOAD_BYTES");
  });

  test("returns the refuted rows on the run that refuted everything", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({ candidates: [CANDIDATE], verdictFor: () => ({ verdict: "REFUTED" }) }),
    );

    expect(run.result.summary).toBe("No findings survived verification.");
    // Strict, and `provenanceSource` is spelled out as the `undefined` the row really carries: the assertion is
    // That a refuted row is these five fields and nothing else, since the footnote renders whatever it holds.
    expect(run.result.refuted).toStrictEqual([
      { file: "a.ts", line: 4, provenance: "new", provenanceSource: undefined, summary: CANDIDATE.summary },
    ]);
  });

  test("lists a resolver's refutation among the refuted", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE],
        resolution: { confidence: 95, evidence: "guarded upstream", verdict: "REFUTED" },
        verdictFor: () => ({ confidence: 40 }),
      }),
    );

    expect(run.result.refuted).toHaveLength(1);
    expect(run.result.stats?.refuted).toBe(1);
  });

  test("returns one report shape", async () => {
    expect.hasAssertions();

    const run = await runReview("high 812", stubFor({ candidates: [CANDIDATE] }));

    expect(Object.keys(run.result).toSorted()).toStrictEqual([
      "findings",
      "level",
      "mode",
      "refuted",
      "stats",
      "summary",
      "target",
    ]);
    expect(run.result.stats?.reported).toBe(1);
  });
});
