import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortInterfaces", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export interface Props { color: string; size: number; }`,
        name: "unsortedInterface",
        source: `export interface Props { size: number; color: string }`,
        violations: 1,
      },
      { name: "sortedInterface", source: `export interface Props { color: string; size: number }`, violations: 0 },
      {
        fixed: `export interface Props { a(): void; z: string; }`,
        name: "methodAndProperty",
        source: `export interface Props { z: string; a(): void }`,
        violations: 1,
      },
      {
        name: "constructSignatureSplitsPartitions",
        source: `export interface Props { b: string; new (): Props; d: number; c: number }`,
        violations: 1,
      },
      {
        name: "unclosedBlockDisableCoversRest",
        source: `/* oxlint-disable sorting/sort-interfaces -- reason */\nexport interface Props { size: number; color: string }`,
        violations: 0,
      },
      {
        fixed: `export interface Props {\n  a: string;\n  e: string;\n  /* oxlint-disable sorting/sort-interfaces -- reason */\n  d: string;\n  c: string;\n}`,
        name: "unclosedBlockDisableKeepsRestInPlace",
        source: `export interface Props {\n  e: string;\n  a: string;\n  /* oxlint-disable sorting/sort-interfaces -- reason */\n  d: string;\n  c: string;\n}`,
        violations: 1,
      },
      {
        fixed: `export interface Props { a: string; "b"(): void; }`,
        name: "literalMethodNamedByValue",
        source: `export interface Props { "b"(): void; a: string }`,
        violations: 1,
      },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-interfaces"],
  });
});
