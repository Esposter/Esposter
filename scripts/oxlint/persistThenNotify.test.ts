import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// The rule only exists as an oxlint JS plugin and @oxlint/plugins ships no RuleTester, so the suite drives
// The real oxlint binary over generated fixtures — which covers plugin loading and visitor keys, not just
// The predicate. Fixtures are written outside the repo so the deliberately-violating ones are never picked
// Up by the root oxlint pass.
const RULE = "persist-then-notify/no-unhandled-effect-after-emit";
const OXLINT_BIN = join(import.meta.dirname, "..", "..", "node_modules", "oxlint", "bin", "oxlint");
const FIXTURES = [
  // The exemption this rule used to carry keyed off static AST containment, which cannot tell a later
  // Iteration from the very next line of the same one — so it silently exempted this, the core hazard.
  { name: "inLoopAfterEmit", source: `for (const x of xs) { aEventEmitter.emit(x); await g(x); }`, violations: 1 },
  // The batched-purge shape: the write is awaited before the emit, so the frame still has no emit when it
  // Is visited. This is why dropping the loop exemption costs the streaming case nothing.
  { name: "inLoopBeforeEmit", source: `for (const x of xs) { await g(x); aEventEmitter.emit(x); }`, violations: 0 },
  { name: "afterEmit", source: `aEventEmitter.emit(); await g();`, violations: 1 },
  { name: "beforeEmit", source: `await g(); aEventEmitter.emit();`, violations: 0 },
  { name: "safeWrapperAfterEmit", source: `aEventEmitter.emit(); await getResultAsync(g);`, violations: 0 },
  {
    name: "promiseAllOverSafeMap",
    source: `aEventEmitter.emit(); await Promise.all(xs.map((x) => createSystemRoomMessage(x)));`,
    violations: 0,
  },
  {
    name: "promiseAllOverUnsafeMap",
    source: `aEventEmitter.emit(); await Promise.all(xs.map((x) => g(x)));`,
    violations: 1,
  },
  // A block body settles on what it returns, so the check reads the returns rather than giving up on the block.
  {
    name: "promiseAllOverSafeBlockBodyMap",
    source: `aEventEmitter.emit(); await Promise.all(xs.map((x) => { const y = f(x); return getResultAsync(() => g(y)); }));`,
    violations: 0,
  },
  {
    name: "promiseAllOverUnsafeBlockBodyMap",
    source: `aEventEmitter.emit(); await Promise.all(xs.map((x) => { return g(x); }));`,
    violations: 1,
  },
  // The emit is the innermost frame's, but it still notifies for the function that awaits that frame.
  {
    name: "emitInNestedCallback",
    source: `await getResultAsync(async () => { await p(); aEventEmitter.emit(); }); await g();`,
    violations: 1,
  },
  // A nested function opens its own frame, so the outer emit does not reach into it.
  { name: "nestedFunction", source: `aEventEmitter.emit(); return async () => { await g(); };`, violations: 0 },
  // Only a `*EventEmitter` receiver carries the persist-then-notify meaning.
  { name: "nonEmitterEmit", source: `analytics.emit(); await g();`, violations: 0 },
];

describe(RULE, () => {
  const violationsByFixture = new Map<string, number>();
  let directory = "";
  let codes: string[] = [];

  beforeAll(() => {
    directory = mkdtempSync(join(tmpdir(), "persist-then-notify-"));
    writeFileSync(
      join(directory, ".oxlintrc.json"),
      JSON.stringify({
        categories: {},
        jsPlugins: [join(import.meta.dirname, "persistThenNotify.ts").replaceAll("\\", "/")],
        plugins: [],
        rules: { [RULE]: "error" },
      }),
    );

    // The rule only tracks awaits inside a function frame, so each fixture body gets a bare async wrapper.
    for (const { name, source } of FIXTURES)
      writeFileSync(join(directory, `${name}.ts`), `export const f = async () => { ${source} };\n`);

    const { status, stderr, stdout } = spawnSync(
      process.execPath,
      [
        OXLINT_BIN,
        "--config",
        join(directory, ".oxlintrc.json"),
        "--format=json",
        "--disable-nested-config",
        directory,
      ],
      { encoding: "utf8" },
    );
    if (!stdout) throw new Error(`oxlint produced no output (status ${status}): ${stderr}`);

    const { diagnostics } = JSON.parse(stdout) as { diagnostics: { code: string; filename: string }[] };
    codes = diagnostics.map(({ code }) => code);

    for (const { name } of FIXTURES) violationsByFixture.set(name, 0);
    for (const { filename } of diagnostics) {
      const name = basename(filename, ".ts");
      violationsByFixture.set(name, (violationsByFixture.get(name) ?? 0) + 1);
    }
  });

  afterAll(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test.each(FIXTURES)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(violationsByFixture.get(name)).toBe(violations);
  });

  test("reports nothing but this rule", () => {
    expect.hasAssertions();

    expect([...new Set(codes)]).toStrictEqual(["persist-then-notify(no-unhandled-effect-after-emit)"]);
  });
});
