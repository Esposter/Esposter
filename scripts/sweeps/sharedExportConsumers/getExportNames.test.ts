import { getExportNames } from "#scripts/sweeps/sharedExportConsumers/getExportNames";
import { describe, expect, test } from "vitest";

describe(getExportNames, () => {
  test.each([
    ["const", "export const name = 1;"],
    ["class", "export class name {}"],
    ["enum", "export enum name {}"],
    ["function", "export function name() {}"],
    ["interface", "export interface name {}"],
    ["type", "export type name = string;"],
  ])("reads the name a %s export declares", (_declaration, text) => {
    expect.hasAssertions();

    expect(getExportNames(text)).toStrictEqual(["name"]);
  });

  test("reads every export in a file rather than the first", () => {
    expect.hasAssertions();

    expect(getExportNames("export const first = 1;\nexport const second = 2;")).toStrictEqual(["first", "second"]);
  });

  // A re-export names nothing of its own, and `export` is line-anchored because it cannot appear inside a block
  test("reports nothing for a re-export or an indented line", () => {
    expect.hasAssertions();

    expect(getExportNames(`export * from "./other";\n  export const nested = 1;`)).toStrictEqual([]);
  });
});
