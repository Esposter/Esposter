import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("sortEnums", () => {
  setupPluginSuite({
    fixtures: [
      {
        fixed: `export enum E { A = "a", B = "b" }`,
        name: "unsortedStringEnum",
        source: `export enum E { B = "b", A = "a" }`,
        violations: 1,
      },
      {
        fixed: `export enum E { A = 1, B = 2 }`,
        name: "unsortedNumericEnum",
        source: `export enum E { B = 2, A = 1 }`,
        violations: 1,
      },
      {
        fixed: `export enum E { B = -1, A = 1 }`,
        name: "numericEnumNegativeByValue",
        source: `export enum E { A = 1, B = -1 }`,
        violations: 1,
      },
      {
        fixed: `export enum E { A = 1, B = "x" }`,
        name: "mixedEnumByName",
        source: `export enum E { B = "x", A = 1 }`,
        violations: 1,
      },
      {
        fixed: `export enum E { B = "b", A = B + "a" }`,
        name: "memberReadsLaterMember",
        source: `export enum E { A = B + "a", B = "b" }`,
        violations: 1,
      },
      {
        fixed: `export enum E { B = "b", A = E.B + "a" }`,
        name: "memberReadsSameEnumByAccess",
        source: `export enum E { A = E.B + "a", B = "b" }`,
        violations: 1,
      },
      {
        name: "numericEnumNegativeTenInOrder",
        source: `export enum E { A = -10, B = -9, C = 9, D = 10 }`,
        violations: 0,
      },
      {
        fixed: `export enum E { B = 1.25, A = 1.5 }`,
        name: "numericEnumDecimals",
        source: `export enum E { A = 1.5, B = 1.25 }`,
        violations: 1,
      },
      { name: "missingInitializerSkipped", source: `export enum E { B, A = 1 }`, violations: 0 },
      { name: "impureInitializerKeepsItsPlace", source: `export enum E { B = f(), A = g() }`, violations: 0 },
    ],
    plugin: "sorting",
    rules: ["sorting/sort-enums"],
  });
});
