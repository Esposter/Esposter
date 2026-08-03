import { describe, expect, test } from "vitest";

import { AREA_ARGS, AREA_SCOPE, CANDIDATE, VERDICT_DEFAULT } from "./constants.test";
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

    expect(run.result.findings?.[0].file).toBe("a.ts");
  });

  test("truncates a finder at its cap and logs what it dropped", async () => {
    expect.hasAssertions();

    const candidates = Array.from({ length: 9 }, (_, index) => ({ ...CANDIDATE, line: index + 1 }));
    const run = await runReview("high", stubFor({ candidates }));

    expect(run.logs).toContainEqual(expect.stringContaining("dropped 3 at cap 6 — coverage truncated"));
    expect(run.result.stats?.candidates).toBe(6);
  });

  test("honours a self-declared kind in area mode only", async () => {
    expect.hasAssertions();

    // In diff mode no prompt explains the kinds, so a self-label would let a correctness finder route its own
    // Defect into cheap verification and a demoted rank.
    const candidates = [{ ...CANDIDATE, kind: "cleanup" }];
    const area = await runReview(AREA_ARGS, stubFor({ candidates, scope: AREA_SCOPE }));
    const diff = await runReview("high", stubFor({ candidates }));

    expect(area.result.findings?.[0].category).toBe("cleanup");
    expect(diff.result.findings?.[0].category).toBe("correctness");
  });

  test("ignores a kind outside the enum", async () => {
    expect.hasAssertions();

    const run = await runReview(
      AREA_ARGS,
      stubFor({ candidates: [{ ...CANDIDATE, kind: "invented" }], scope: AREA_SCOPE }),
    );

    expect(run.result.findings?.[0].category).toBe("correctness");
  });

  test("survives a finder that died", async () => {
    expect.hasAssertions();

    const run = await runReview(
      "high",
      stubFor({ finderFor: (label) => (label === "angle-A" ? null : label === "angle-B" ? [CANDIDATE] : []) }),
    );

    expect(run.result.findings).toHaveLength(1);
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
    expect(run.result.findings?.[0].file).toBe("b.ts");
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

  test("lets a verdict stand when the agent gave no confidence number", async () => {
    expect.hasAssertions();

    // A missing number reads as exactly the floor, so schema drift never mass-downgrades a run.
    const run = await runReview(
      "high",
      stubFor({ candidates: [CANDIDATE], verdictFor: () => ({ confidence: undefined }) }),
    );

    expect(run.result.findings?.[0].verdict).toBe("CONFIRMED");
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
