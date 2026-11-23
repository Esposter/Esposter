import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortIntersectionTypes", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export type X = A & B;`,
        name: "unsortedIntersection",
        source: `export type X = B & A;`,
        violations: 1,
      },
      { name: "sortedIntersection", source: `export type X = A & B;`, violations: 0 },
      {
        fixed: `export type X = (A | B) & Z;`,
        name: "unsortedParenthesizedUnionMember",
        source: `export type X = Z & (A | B);`,
        violations: 1,
      },
      { name: "callableMethodSkipped", source: `export type X = { f(): void } & B & A;`, violations: 0 },
      { name: "callablePropertySkipped", source: `export type X = { p: () => void } & B & A;`, violations: 0 },
      {
        fixed: `export type X = { a: number } & { z: string };`,
        name: "objectMembersNotCallable",
        source: `export type X = { z: string } & { a: number };`,
        violations: 1,
      },
      {
        fixed: `export type X = "a" & "b";`,
        name: "literalMembers",
        source: `export type X = "b" & "a";`,
        violations: 1,
      },
      {
        fixed: `export let v: A & B = undefined as never;`,
        name: "annotatedOnce",
        source: `export let v: B & A = undefined as never;`,
        violations: 1,
      },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-intersection-types"],
  });
});
