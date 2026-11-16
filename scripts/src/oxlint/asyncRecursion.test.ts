import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("asyncRecursion", () => {
  const RULE = "async-recursion/no-async-self-call";
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
  setupPluginSuite({ fixtures: FIXTURES, plugin: "asyncRecursion", rules: [RULE] });
});
