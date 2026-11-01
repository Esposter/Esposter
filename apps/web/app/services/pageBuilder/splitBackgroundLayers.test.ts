import { splitBackgroundLayers } from "@/services/pageBuilder/splitBackgroundLayers";
import { describe, expect, test } from "vitest";

describe(splitBackgroundLayers, () => {
  test("a blank value holds no layers", () => {
    expect.hasAssertions();

    expect(splitBackgroundLayers("")).toStrictEqual([]);
  });

  test.each([
    ["url(a), linear-gradient(red, blue)", ["url(a)", "linear-gradient(red, blue)"]],
    ['url("a,b"), linear-gradient(red, blue)', ['url("a,b")', "linear-gradient(red, blue)"]],
  ])("%j splits at the commas outside its parentheses and quotes", (value, layers) => {
    expect.hasAssertions();

    expect(splitBackgroundLayers(value)).toStrictEqual(layers);
  });
});
