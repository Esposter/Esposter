import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortObjectTypes", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export type T = { a: number; b: string; };`,
        name: "unsortedMembers",
        source: `export type T = { b: string; a: number };`,
        violations: 1,
      },
      { name: "sortedMembers", source: `export type T = { a: number; b: string };`, violations: 0 },
      {
        name: "callSignatureSplitsPartitions",
        source: `export type T = { b: string; (): void; d: number; c: number };`,
        violations: 1,
      },
      {
        fixed: `export type T = { a: number; b?: string; c(): void; };`,
        name: "optionalAndMethodMembers",
        source: `export type T = { c(): void; b?: string; a: number };`,
        violations: 2,
      },
      {
        fixed: `export type T = { a: number\n b: string; };`,
        name: "multilineMembers",
        source: `export type T = { b: string;\n a: number };`,
        violations: 1,
      },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-object-types"],
  });
});
