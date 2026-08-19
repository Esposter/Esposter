import { describe, expect, test } from "vitest";

import { AREA_ARGS, AREA_SCOPE, CANDIDATE } from "./constants.test";
import { createCandidates } from "./createCandidates.test";
import { createCorrectnessOnly } from "./createCorrectnessOnly.test";
import { createSplitAcrossFinders } from "./createSplitAcrossFinders.test";
import { getFinding } from "./getFinding.test";
import { getResolveLog } from "./getResolveLog.test";
import { runReview } from "./runReview.test";
import { stubFor } from "./stubFor.test";

// Dedupe and resolution. One floor, enforced here: a verdict its own author would not defend routes the finding
// To the pass with the budget to settle it, and nothing is dropped for confidence.
const UNDER_CONFIDENT = () => ({ confidence: 40 });

describe("code-review dedupe and resolve", () => {
  const RESOLVED = { confidence: 95, evidence: "read the callee", verdict: "CONFIRMED" };

  test("collapses two reports of one line into a single finding", async () => {
    expect.hasAssertions();

    // Correctness angles only: the conventions finder's copies carry kind `cleanup`, which is a separate row by
    // Design, and answering it here would test the cross-kind rule instead of this one.
    const run = await runReview(
      "high",
      stubFor({
        finderFor: createCorrectnessOnly(() => [{ ...CANDIDATE }, { ...CANDIDATE, summary: "Same bug" }]),
      }),
    );

    expect(run.result.findings).toHaveLength(1);
    expect(run.result.stats?.deduped).toBeGreaterThan(0);
  });

  test("keeps a record finding and a code defect at one line apart", async () => {
    expect.hasAssertions();

    // One is a code fix and the other a doc edit, so collapsing them deletes a deliverable.
    const run = await runReview(
      AREA_ARGS,
      stubFor({
        candidates: [
          { ...CANDIDATE, kind: "correctness" },
          { ...CANDIDATE, kind: "conformance", summary: "The page describes behaviour the code lost" },
        ],
        scope: AREA_SCOPE,
      }),
    );

    expect(run.result.findings).toHaveLength(2);
    expect(run.result.stats?.deduped).toBe(0);
  });

  test("never dedupes findings that named no line", async () => {
    expect.hasAssertions();

    // Keyed on loc() alone they degrade to the bare filename, so two undocumented decisions in one file collapse.
    const run = await runReview(
      AREA_ARGS,
      stubFor({
        candidates: [
          { ...CANDIDATE, kind: "record-gap", line: undefined, summary: "The retry cap is undocumented" },
          { ...CANDIDATE, kind: "record-gap", line: undefined, summary: "The ordering is undocumented" },
        ],
        scope: AREA_SCOPE,
      }),
    );

    expect(run.result.findings).toHaveLength(2);
  });

  test("counts corroboration by distinct finders, not by report count", async () => {
    expect.hasAssertions();

    // Two reports each, so the report count is twice the finder count and a count of reports cannot pass. The
    // Expected number comes from the run's own fan-out — hardcoded, this fails as a corroboration bug the day a
    // Level or the small-territory trim changes how many angles run.
    const run = await runReview(
      "high",
      stubFor({
        finderFor: createCorrectnessOnly(() => [{ ...CANDIDATE }, { ...CANDIDATE, summary: "Same bug" }]),
      }),
    );
    const angles = run.calls.filter((call) => call.label.startsWith("angle-")).length;

    expect(angles).toBeGreaterThan(1);
    expect(getFinding(run).summary).toContain(`[independently reported by ${angles} finders]`);
  });

  test("lets the better-evidenced report lead its group", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({
        finderFor: createCorrectnessOnly((label) => [{ ...CANDIDATE, summary: label }]),
        verdictFor: (index) => (index === 2 ? { severity: "critical" } : {}),
      }),
    );

    expect(getFinding(run).severity).toBe("critical");
  });

  test("lets the worse READING lead its group, not merely the settled one", async () => {
    expect.hasAssertions();

    // The dedupe picks its primary by the same ordering the report ranks by. Verdict-first, a CONFIRMED minor
    // Outranks a PLAUSIBLE critical at one line: toFinding still escalates the row to critical, but every word of
    // Its text comes from the minor, and the critical's own summary is printed nowhere — pre-merged members are
    // Deliberately not listed in `also`. The reader then fixes the wrong thing at a critical-labelled line.
    const run = await runReview(
      "high",
      stubFor({
        finderFor: createCorrectnessOnly((label) => [{ ...CANDIDATE, summary: label }]),
        verdictFor: (index) =>
          index === 0 ? { confidence: 40, severity: "critical" } : { confidence: 95, severity: "minor" },
      }),
    );

    expect(getFinding(run).severity).toBe("critical");
    expect(getFinding(run).summary).toContain("angle-A");
  });

  test("dedupes before spending the resolve budget", async () => {
    expect.hasAssertions();

    // A resolver is the costliest agent in the run, so N clones of one line must collapse first: resolving first
    // Buys N full-effort agents to settle one location, and evicts N-1 genuinely distinct findings from the budget.
    const run = await runReview(
      "high",
      stubFor({
        finderFor: createCorrectnessOnly(() => [{ ...CANDIDATE }]),
        resolution: RESOLVED,
        verdictFor: UNDER_CONFIDENT,
      }),
    );

    expect(run.calls.filter((call) => call.label.startsWith("resolve:"))).toHaveLength(1);
    expect(run.logs).toContainEqual(getResolveLog(1));
  });

  test("routes an under-confident CONFIRMED to a resolver instead of reporting it", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({ candidates: [CANDIDATE], resolution: RESOLVED, verdictFor: UNDER_CONFIDENT }),
    );

    expect(run.logs).toContainEqual(getResolveLog(1));
    expect(getFinding(run)).toMatchObject({ confidence: 95, verdict: "CONFIRMED" });
  });

  test("routes an under-confident REFUTED to a resolver rather than dismissing the finding", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE],
        resolution: { confidence: 95, evidence: "read the guard", verdict: "REFUTED" },
        verdictFor: () => ({ confidence: 30, verdict: "REFUTED" }),
      }),
    );

    expect(run.logs).toContainEqual(getResolveLog(1));
    expect(run.result.findings).toHaveLength(0);
  });

  test("keeps a finding whose resolver died, still unsettled", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({ candidates: [CANDIDATE], resolution: null, verdictFor: UNDER_CONFIDENT }),
    );

    expect(run.result.findings).toHaveLength(1);
    expect(getFinding(run).verdict).toBe("PLAUSIBLE");
  });

  test("treats a resolver's own under-confident verdict as no answer", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE],
        resolution: { confidence: 30, evidence: "could not reach it", verdict: "REFUTED" },
        verdictFor: UNDER_CONFIDENT,
      }),
    );

    expect(getFinding(run).unresolvedBlocker).toContain("below the floor");
    expect(getFinding(run).verdict).toBe("PLAUSIBLE");
  });

  test("keeps the verifier's confidence when the resolver could not settle it", async () => {
    expect.hasAssertions();

    // An UNRESOLVABLE's number is about the resolution attempt, not about the finding.
    const run = await runReview(
      "high",
      stubFor({
        candidates: [CANDIDATE],
        resolution: { blocker: "the deployed value", confidence: 20, evidence: "not here", verdict: "UNRESOLVABLE" },
        verdictFor: () => ({ confidence: 45 }),
      }),
    );

    expect(getFinding(run).confidence).toBe(45);
  });

  test("names findings dropped at the resolve budget in the summary", async () => {
    expect.hasAssertions();

    const many = createCandidates(8);
    const run = await runReview(
      "high",
      stubFor({
        finderFor: createSplitAcrossFinders(many, 6),
        resolution: RESOLVED,
        verdictFor: UNDER_CONFIDENT,
      }),
    );

    // The pair, not the count alone: `droppedUnsettled` says the budget ran out and `resolveCeiling` says what it
    // Was, and run-economics sends the reader to the second to tell "nothing else needed resolving" apart from
    // "the budget ran out". Asserting it is also what keeps `ReviewStats` honest — the field was emitted and
    // Documented for two rounds while the interface omitted it, because no test ever read it.
    expect(run.result.stats?.droppedUnsettled).toBe(2);
    expect(run.result.stats?.resolveCeiling).toBe(6);
    expect(run.result.summary).toContain("dropped unsettled at the resolve budget");
  });

  test("spends the resolve budget worst-first", async () => {
    expect.hasAssertions();

    const many = createCandidates(8);
    const run = await runReview(
      "high",
      stubFor({
        finderFor: createSplitAcrossFinders(many, 6),
        resolution: RESOLVED,
        // Index 7 arrives last, past the six-finding budget: a resolver spending it in arrival order never
        // Reaches this candidate, so only a worst-first spend can confirm it.
        verdictFor: (index) => ({ confidence: 40, severity: index === 7 ? "critical" : "minor" }),
      }),
    );
    const resolved = run.result.findings?.filter((finding) => finding.verdict === "CONFIRMED") ?? [];

    expect(resolved.some((finding) => finding.severity === "critical")).toBe(true);
  });
});
