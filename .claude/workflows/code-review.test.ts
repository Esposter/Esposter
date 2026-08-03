import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

// The script is a workflow body, not a module: it uses top-level `return` and the harness-injected globals
// (`args`, `agent`, `log`, `parallel`, `phase`), so `import` cannot load it and it cannot be split into modules
// to make it loadable — see the `.claude/workflows/*.js` entry in the file-organization skill. Reading the real
// file and evaluating it as an async function body is therefore the ONLY way to test the shipped artefact; a
// copy of its logic here would pass while the file it stands in for was broken.
const SCRIPT_PATH = fileURLToPath(new URL("code-review.js", import.meta.url));
const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
  ...parameters: string[]
) => (...values: unknown[]) => Promise<Record<string, unknown>>;

interface Candidate {
  failure_scenario?: string;
  file: string;
  kind?: string;
  line?: number;
  summary: string;
}
interface AgentOptions {
  label?: string;
  phase?: string;
}
/**
 * Answers one agent call. Returning null models an agent that died, which several of the workflow's contracts
 * turn on — a run whose resolvers all failed must not read as a clean one.
 */
type AgentStub = (prompt: string, options: AgentOptions) => unknown;
interface RunResult {
  logs: string[];
  prompts: { label: string; prompt: string }[];
  result: Record<string, unknown>;
}

const VERDICT_DEFAULT = { confidence: 90, evidence: "read the line", provenance: "new", severity: "major" };
const SCOPE_DEFAULT = {
  changedLines: 900,
  claudeMdFiles: [],
  conventions: "",
  diffCommand: "git diff main...HEAD",
  files: ["a.ts", "b.ts"],
  recordIndex: "",
  summary: "a change",
};

/**
 * Drives one whole run of the real script against stubbed agents, and hands back everything a caller can assert
 * on: the returned report, the logs, and the prompts every agent was actually given. Prompts are part of the
 * observable behaviour here — a verifier told "do NOT open" the one file that settles its claim is a defect no
 * assertion on the returned findings could catch.
 */
const runReview = async (args: string, agentStub: AgentStub): Promise<RunResult> => {
  const source = await readFile(SCRIPT_PATH, "utf8");
  const body = source.replace(/^export const meta/mu, "const meta");
  const logs: string[] = [];
  const prompts: { label: string; prompt: string }[] = [];
  const run = new AsyncFunction("args", "log", "agent", "parallel", "phase", "pipeline", "budget", "workflow", body);
  const agent = async (prompt: string, options: AgentOptions = {}) => {
    prompts.push({ label: options.label ?? "", prompt });
    return agentStub(prompt, options);
  };
  const parallel = async (thunks: (() => Promise<unknown>)[]) => Promise.all(thunks.map((thunk) => thunk()));
  const result = await run(
    args,
    (message: string) => logs.push(message),
    agent,
    parallel,
    () => undefined,
    undefined,
    { total: null },
    undefined,
  );
  return { logs, prompts, result };
};

/** The `[i]` labels a verifier prompt lists, so a stub can answer per candidate without re-deriving the order. */
const candidateIndexes = (prompt: string) => [...prompt.matchAll(/^\[(\d+)\] /gmu)].map((m) => Number(m[1]));

/**
 * The default responder: one finder returns `candidates`, every verifier CONFIRMS what it is given, and the
 * synthesizer is skipped so findings come through the backfill path. Individual tests override one leg.
 */
const stubFor = ({
  candidates = [],
  resolution,
  scope = {},
  synthesis = null,
  verdictFor = () => ({}),
}: {
  candidates?: Candidate[];
  resolution?: unknown;
  scope?: Record<string, unknown>;
  synthesis?: unknown;
  verdictFor?: (index: number, prompt: string) => Record<string, unknown>;
}): AgentStub => {
  let isFirstFinder = true;
  return (prompt, options) => {
    const label = options.label ?? "";
    if (label === "scope") return { ...SCOPE_DEFAULT, ...scope };
    if (label === "synthesize") return synthesis;
    if (label.startsWith("resolve:")) return resolution;
    if (label.startsWith("verify:"))
      return {
        verdicts: candidateIndexes(prompt).map((index) => ({
          index,
          verdict: "CONFIRMED",
          ...VERDICT_DEFAULT,
          ...verdictFor(index, prompt),
        })),
      };
    // Only the first finder returns candidates: every finder sees the same territory here, so answering them all
    // Would make each test's candidate set arrive once per angle and hide the dedupe under a pile of duplicates.
    if (isFirstFinder) {
      isFirstFinder = false;
      return { candidates };
    }
    return { candidates: [] };
  };
};

const CANDIDATE: Candidate = {
  failure_scenario: "it drops the row",
  file: "a.ts",
  line: 4,
  summary: "Reordered write drops the entity",
};
const findings = (run: RunResult) => run.result.findings as Record<string, unknown>[];
const stats = (run: RunResult) => run.result.stats as Record<string, number>;

describe("code-review workflow", () => {
  describe("argument parsing", () => {
    test.each([
      ["", "diff", "high", ""],
      ["high", "diff", "high", ""],
      ["diff xhigh", "diff", "xhigh", ""],
      ["area high packages/x", "area", "high", "packages/x"],
      ["xhigh 812", "diff", "xhigh", "812"],
      // A diff target is free-form English, so a leading mode word only switches modes when a level follows it —
      // Otherwise "area of message deletion that PR 812 touched" buys a whole-subsystem audit nobody asked for.
      ["area of message deletion that PR 812 touched", "diff", "high", "area of message deletion that PR 812 touched"],
      // Own-property check: an Object.prototype key must not parse as a level.
      ["constructor 812", "diff", "high", "constructor 812"],
    ])("parses %j as %s/%s", async (args, mode, level, target) => {
      expect.hasAssertions();

      const run = await runReview(args, stubFor({}));

      expect(run.logs[0]).toBe(
        mode + " mode, " + level + " effort, target: " + (target ? '"' + target + '"' : "(the working diff)"),
      );
    });
  });

  describe("fan-out", () => {
    test("trims the angle count on a small territory", async () => {
      expect.hasAssertions();

      const run = await runReview("high", stubFor({ scope: { changedLines: 120, files: ["a.ts"] } }));

      expect(run.logs).toContainEqual(expect.stringContaining("small territory (120 lines)"));
      expect(stats(run).angles).toBe(2);
      expect(stats(run).perAngle).toBe(4);
    });

    test("keeps the level's fan-out when the Scope agent reports no size", async () => {
      expect.hasAssertions();

      const run = await runReview("high", stubFor({ scope: { changedLines: undefined } }));

      expect(stats(run).angles).toBe(3);
      expect(stats(run).perAngle).toBe(6);
    });
  });

  describe("dedupe", () => {
    test("collapses two reports of one line into a single finding", async () => {
      expect.hasAssertions();

      const run = await runReview("high", stubFor({ candidates: [CANDIDATE, { ...CANDIDATE, summary: "Same bug" }] }));

      expect(findings(run)).toHaveLength(1);
      expect(stats(run).deduped).toBe(1);
    });

    test("keeps a record finding and a code defect at one line apart", async () => {
      expect.hasAssertions();

      // Kind is only settable in area mode, which is where a bug and the doc sentence describing it collide.
      const run = await runReview(
        "area high the cache",
        stubFor({
          candidates: [
            { ...CANDIDATE, kind: "correctness" },
            { ...CANDIDATE, kind: "conformance", summary: "The page describes behaviour the code lost" },
          ],
          scope: { claims: [], files: ["a.ts"] },
        }),
      );

      expect(findings(run)).toHaveLength(2);
      expect(stats(run).deduped).toBe(0);
    });
  });

  describe("confidence", () => {
    test("routes an under-confident CONFIRMED to a resolver instead of reporting it", async () => {
      expect.hasAssertions();

      const run = await runReview(
        "high",
        stubFor({
          candidates: [CANDIDATE],
          resolution: { confidence: 95, evidence: "read the callee", verdict: "CONFIRMED" },
          verdictFor: () => ({ confidence: 40 }),
        }),
      );

      expect(run.logs).toContainEqual("resolve: 1 plausible findings to settle");
      expect(findings(run)[0]).toMatchObject({ confidence: 95, verdict: "CONFIRMED" });
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

      expect(run.logs).toContainEqual("resolve: 1 plausible findings to settle");
      expect(findings(run)).toHaveLength(0);
    });

    test("treats a resolver's own under-confident verdict as no answer", async () => {
      expect.hasAssertions();

      const run = await runReview(
        "high",
        stubFor({
          candidates: [CANDIDATE],
          resolution: { confidence: 30, evidence: "could not reach it", verdict: "REFUTED" },
          verdictFor: () => ({ confidence: 40 }),
        }),
      );

      expect(findings(run)[0].unresolvedBlocker).toContain("below the floor");
      expect(findings(run)[0].verdict).toBe("PLAUSIBLE");
    });

    test("keeps a finding whose resolver died", async () => {
      expect.hasAssertions();

      const run = await runReview(
        "high",
        stubFor({ candidates: [CANDIDATE], resolution: null, verdictFor: () => ({ confidence: 40 }) }),
      );

      expect(findings(run)).toHaveLength(1);
      expect(findings(run)[0].verdict).toBe("PLAUSIBLE");
    });

    test("names findings dropped at the resolve budget in the summary", async () => {
      expect.hasAssertions();

      // RESOLVE_MAX is 2 × the angle count, so `high` settles 6 and drops the rest — a budget the run must
      // Declare, since a dropped finding was never examined by anything and is not a clean bill of health.
      const many = Array.from({ length: 8 }, (_, i) => ({ ...CANDIDATE, line: i + 1 }));
      const base = stubFor({
        candidates: many.slice(0, 6),
        resolution: { confidence: 95, evidence: "read the callee", verdict: "CONFIRMED" },
        verdictFor: () => ({ confidence: 40 }),
      });
      const run = await runReview("high", (prompt, options) =>
        options.label === "angle-B" ? { candidates: many.slice(6) } : base(prompt, options),
      );

      expect(stats(run).droppedUnsettled).toBe(2);
      expect(run.result.summary).toContain("dropped unsettled at the resolve budget");
    });
  });

  describe("unsettleable findings", () => {
    test("reports an UNRESOLVABLE that named no blocker", async () => {
      expect.hasAssertions();

      const run = await runReview(
        "high",
        stubFor({
          candidates: [CANDIDATE],
          resolution: { confidence: 80, evidence: "needs the deployed value", verdict: "UNRESOLVABLE" },
          verdictFor: () => ({ confidence: 40 }),
        }),
      );

      expect(findings(run)).toHaveLength(1);
      expect(findings(run)[0].unresolvedBlocker).toBe("the resolver named no blocker");
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

      expect(findings(run)[0].unresolvedBlocker).toBe("the deployed MAX_UPLOAD_BYTES");
    });
  });

  describe("report assembly", () => {
    test("derives a short summary without cutting at a decimal point", async () => {
      expect.hasAssertions();

      const run = await runReview(
        "high",
        stubFor({ candidates: [{ ...CANDIDATE, summary: "Cache TTL of 0.5s is ignored" }] }),
      );

      expect(findings(run)[0].shortSummary).toBe("Cache TTL of 0.5s is ignored");
    });

    test("says nothing was found only when nothing was dropped unexamined", async () => {
      expect.hasAssertions();

      const run = await runReview(
        "high",
        stubFor({ candidates: [CANDIDATE], verdictFor: () => ({ verdict: "REFUTED" }) }),
      );

      expect(run.result.summary).toBe("No findings survived verification.");
      expect(findings(run)).toHaveLength(0);
    });
  });

  describe("verifier scope", () => {
    test("hands over the whole diff for a file the change never touched", async () => {
      expect.hasAssertions();

      const run = await runReview("high", stubFor({ candidates: [{ ...CANDIDATE, file: "untouched.ts" }] }));
      const verifier = run.prompts.find((p) => p.label.startsWith("verify:"));

      expect(verifier?.prompt).toContain("is NOT in this change");
    });

    test("names the area's files beside an out-of-area one in area mode", async () => {
      expect.hasAssertions();

      const run = await runReview(
        "area high the cache",
        stubFor({
          candidates: [{ ...CANDIDATE, file: "server/caller.ts" }],
          scope: { claims: [], files: ["cache/a.ts", "cache/b.ts"] },
        }),
      );
      const verifier = run.prompts.find((p) => p.label.startsWith("verify:"));

      expect(verifier?.prompt).toContain("is NOT part of the audited area");
      expect(verifier?.prompt).toContain("cache/a.ts");
    });

    test("does not append a pathspec to a diff command that carries two commands", async () => {
      expect.hasAssertions();

      const run = await runReview(
        "high",
        stubFor({
          candidates: [CANDIDATE],
          scope: { diffCommand: "git diff main...HEAD\ngit diff HEAD" },
        }),
      );
      const verifier = run.prompts.find((p) => p.label.startsWith("verify:"));

      expect(verifier?.prompt).toContain("could not be narrowed safely");
    });
  });

  describe("area scoping", () => {
    test("drops a seam whose prefixes resolve to no file in scope", async () => {
      expect.hasAssertions();

      const run = await runReview(
        "area high the cache",
        stubFor({
          scope: {
            claims: [],
            files: Array.from({ length: 30 }, (_, i) => "cache/f" + i + ".ts"),
            seams: [
              { name: "real", pathPrefixes: ["cache/f1.ts"], summary: "" },
              { name: "ghost", pathPrefixes: ["cache/**/*.ts"], summary: "" },
            ],
          },
        }),
      );

      expect(run.logs).toContainEqual(expect.stringContaining("1 seam(s) dropped"));
      // One usable seam is not a partition, so the run must fall back to lens rather than review through it.
      expect(run.result.stats).toMatchObject({ findMode: "lens" });
    });

    test("keeps a claim whose prefixes resolve to nothing when the file cap never fired", async () => {
      expect.hasAssertions();

      const run = await runReview(
        "area high the cache",
        stubFor({
          scope: {
            claims: [{ claim: "reads are single-flight", pathPrefixes: ["cache/**/*.ts"], source: "docs/cache.md" }],
            files: ["cache/a.ts"],
          },
        }),
      );

      expect(stats(run).claimsInventoried).toBe(1);
      expect(stats(run).claimsChecked).toBe(1);
    });

    test("counts a claim as checked only when its finder returned", async () => {
      expect.hasAssertions();

      const scope = {
        claims: [{ claim: "reads are single-flight", source: "docs/cache.md" }],
        files: ["cache/a.ts"],
      };
      const stub = stubFor({ scope });
      const run = await runReview("area high the cache", (prompt, options) =>
        options.label === "conformance" ? null : stub(prompt, options),
      );

      expect(stats(run).claimsInventoried).toBe(1);
      expect(stats(run).claimsChecked).toBe(0);
    });
  });
});
