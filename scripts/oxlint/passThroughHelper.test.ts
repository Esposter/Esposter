import { jsonDateParse } from "@esposter/shared";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// The rule only exists as an oxlint JS plugin and @oxlint/plugins ships no RuleTester, so the suite drives the
// Real oxlint binary over generated fixtures — which covers plugin loading and visitor keys, not just the
// Predicate. Fixtures are written outside the repo so the deliberately-violating ones are never picked up by
// The root oxlint pass.
const RULE = "pass-through-helper/no-forwarding-wrapper";
const OXLINT_BIN = join(import.meta.dirname, "..", "..", "node_modules", "oxlint", "bin", "oxlint");
const FIXTURES = [
  { name: "forwardsEveryParameter", source: `export const a = (b: string) => f(b);`, violations: 1 },
  { name: "forwardsNothing", source: `export const a = () => f();`, violations: 1 },
  { name: "forwardsAwaited", source: `export const a = async (b: string) => await f(b);`, violations: 1 },
  // The construction shape of the same thing: `new X(a, b)` renames the constructor and nothing else.
  { name: "forwardsToConstructor", source: `export const a = (b: string, c: string) => new X(b, c);`, violations: 1 },
  // A receiver taken from the caller is forwarded too, so a rest arg over it is still a pure forward.
  {
    name: "forwardsToParameterReceiver",
    source: `export const a = (b: Client, ...c: string[]) => b.d(...c);`,
    violations: 1,
  },
  // Everything below absorbs something the caller no longer states.
  { name: "suppliesConstantArgument", source: `export const a = (b: string) => f(b, LIMIT);`, violations: 0 },
  { name: "suppliesLiteralArgument", source: `export const a = (b: string) => f(b, "");`, violations: 0 },
  { name: "suppliesCallback", source: `export const a = (b: string[]) => f(b, (c) => c);`, violations: 0 },
  { name: "reordersArguments", source: `export const a = (b: string, c: string) => f(c, b);`, violations: 0 },
  { name: "dropsArgument", source: `export const a = (b: string, _c: string) => f(b);`, violations: 0 },
  { name: "suppliesDefault", source: `export const a = (b: string, c = "") => f(b, c);`, violations: 0 },
  // The receiver is the constant the wrapper exists to hold — the `UUIDV4_REGEX.test(uuid)` shape.
  { name: "suppliesConstantReceiver", source: `export const a = (b: string) => UUIDV4_REGEX.test(b);`, violations: 0 },
  // A destructured parameter is a shape the caller did not have to know.
  { name: "destructuresParameter", source: `export const a = ({ b }: { b: string }) => f(b);`, violations: 0 },
  // Not a call at all: a member read, a literal, or a body doing real work.
  { name: "readsMember", source: `export const a = () => b.c;`, violations: 0 },
  { name: "buildsObject", source: `export const a = (b: string) => ({ b });`, violations: 0 },
  { name: "chainsCall", source: `export const a = (b: string) => f(b).c();`, violations: 0 },
  // An identity function pins inference; it forwards nothing because it calls nothing.
  { name: "identityFunction", source: `export const a = (b: string) => b;`, violations: 0 },
  // A local helper is not the package's surface, so it is nobody's call site to get wrong.
  { name: "unexportedWrapper", source: `const a = (b: string) => f(b);\nexport const c = () => a("");`, violations: 0 },
];

describe(RULE, () => {
  const violationsByFixture = new Map<string, number>();
  let directory = "";
  let codes: string[] = [];

  beforeAll(() => {
    directory = mkdtempSync(join(tmpdir(), "pass-through-helper-"));
    writeFileSync(
      join(directory, ".oxlintrc.json"),
      JSON.stringify({
        categories: {},
        jsPlugins: [join(import.meta.dirname, "passThroughHelper.ts").replaceAll("\\", "/")],
        plugins: [],
        rules: { [RULE]: "error" },
      }),
    );

    for (const { name, source } of FIXTURES) writeFileSync(join(directory, `${name}.ts`), `${source}\n`);

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

    const { diagnostics } = jsonDateParse<{ diagnostics: { code: string; filename: string }[] }>(stdout);
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

    expect([...new Set(codes)]).toStrictEqual(["pass-through-helper(no-forwarding-wrapper)"]);
  });
});
