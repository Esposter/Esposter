import { splitStyleLength } from "@/services/pageBuilder/splitStyleLength";
import { describe, expect, test } from "vitest";

describe(splitStyleLength, () => {
  test.each([
    ["12px", { amount: "12", unit: "px" }],
    ["-1.5rem", { amount: "-1.5", unit: "rem" }],
    ["50%", { amount: "50", unit: "%" }],
    ["", { amount: "", unit: "" }],
    ["12", { amount: "12", unit: "" }],
  ])("%s splits into its number and unit", (value, parts) => {
    expect.hasAssertions();

    expect(splitStyleLength(value)).toStrictEqual(parts);
  });

  test("a value that is not a length splits to nothing", () => {
    expect.hasAssertions();

    expect(splitStyleLength("auto")).toBeUndefined();
  });
});
