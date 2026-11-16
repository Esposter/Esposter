import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sequential-loops/no-async-self-call", () => {
  const RULE = "sequential-loops/no-async-self-call";
  const FIXTURES = [
    {
      name: "pagesByCallingItself",
      source: "export const a = async (b?: string): Promise<string[]> => [...(await f(b)), ...(b ? await a() : [])];",
      violations: 1,
    },
    {
      name: "retriesByReturningItself",
      source: "export async function a(b: number) {\n  if (b > 0) return a(b - 1);\n}",
      violations: 1,
    },
    // A parameter that shares the function's name is another binding, so calling it is not a self-call
    {
      name: "parameterShadowsName",
      source: "export const run = async (run: () => Promise<void>): Promise<void> => {\n  await run();\n};",
      violations: 0,
    },
    {
      name: "namedFunctionExpression",
      source: "export const a = async function b() {\n  await b();\n};",
      violations: 1,
    },
    // A tree's branches run together from a callback, which is the callback's call rather than the function's own
    {
      name: "walksBranchesTogether",
      source: "export const a = async (b: X): Promise<void> => {\n  await Promise.all(b.c.map((d) => a(d)));\n};",
      violations: 0,
    },
    // Recursion that awaits nothing is a walk, not a sequence of awaits
    {
      name: "synchronousRecursion",
      source: "export const a = (b: number): number => (b > 0 ? a(b - 1) : b);",
      violations: 0,
    },
    { name: "callsAnotherFunction", source: "export const a = async () => {\n  await b();\n};", violations: 0 },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "sequentialLoops", rules: [RULE] });
});

describe("sequential-loops/require-loop-shape", () => {
  const RULE = "sequential-loops/require-loop-shape";
  const LOOP = "export const a = async (b: string[]) => {\n  for (const c of b) {\n";
  const FIXTURES = [
    {
      name: "namesShape",
      source: `${LOOP}    // oxlint-disable-next-line no-await-in-loop -- Retry: the next attempt exists because this one failed\n    await f(c);\n  }\n};`,
      violations: 0,
    },
    {
      name: "namesShapePerClause",
      source: `/* oxlint-disable no-await-in-loop -- Pagination: the cursor is the last page's; Retry: a refusal is sent again */\n${LOOP}    await f(c);\n    await g(c);\n  }\n};`,
      violations: 0,
    },
    {
      name: "arguesAfresh",
      source: `${LOOP}    // oxlint-disable-next-line no-await-in-loop -- there are only a few\n    await f(c);\n  }\n};`,
      violations: 1,
    },
    {
      name: "leavesOneClauseUnnamed",
      source: `/* oxlint-disable no-await-in-loop -- Retry: a refusal is sent again; the rest are small */\n${LOOP}    await f(c);\n    await g(c);\n  }\n};`,
      violations: 1,
    },
    // A shape that is not on the page is argued there first
    {
      name: "namesUnlistedShape",
      source: `${LOOP}    // oxlint-disable-next-line no-await-in-loop -- Polling: each reading follows the last wait\n    await f(c);\n  }\n};`,
      violations: 1,
    },
  ];
  setupPluginSuite({ fixtures: FIXTURES, plugin: "sequentialLoops", rules: [RULE] });
});
