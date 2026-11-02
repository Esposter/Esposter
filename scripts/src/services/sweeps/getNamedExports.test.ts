import { getNamedExports } from "#src/services/sweeps/getNamedExports";
import { describe, expect, test } from "vitest";

describe(getNamedExports, () => {
  test.each([
    ["const", "export const name = 1;", "const"],
    ["class", "export class name {}", "class"],
    ["enum", "export enum name {}", "enum"],
    ["function", "export function name() {}", "function"],
    ["interface", "export interface name {}", "interface"],
    ["type", "export type name = string;", "type"],
    ["let", "export let name = 0;", "let"],
    ["async function", "export async function name() {}", "function"],
    ["declare const", "export declare const name: string;", "const"],
    ["abstract class", "export abstract class name {}", "class"],
    ["declare abstract class", "export declare abstract class name {}", "class"],
  ])("reads the name a %s export declares", (_declaration, text, kind) => {
    expect.hasAssertions();

    expect(getNamedExports(text)).toStrictEqual([{ kind, name: "name" }]);
  });

  test("reads every export in a file rather than the first", () => {
    expect.hasAssertions();

    expect(getNamedExports("export const first = 1;\nexport const second = 2;")).toStrictEqual([
      { kind: "const", name: "first" },
      { kind: "const", name: "second" },
    ]);
  });

  // A re-export names nothing of its own, and `export` is line-anchored because it cannot appear inside a block
  test("reports nothing for a re-export or an indented line", () => {
    expect.hasAssertions();

    expect(getNamedExports(`export * from "./other";\n  export const nested = 1;`)).toStrictEqual([]);
  });
});
