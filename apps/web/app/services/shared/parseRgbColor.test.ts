import { parseRgbColor } from "@/services/shared/parseRgbColor";
import { describe, expect, test } from "vitest";

describe(parseRgbColor, () => {
  test("a colour the browser computes in rgb is read as its sRGB channels", () => {
    expect.hasAssertions();

    expect(parseRgbColor("rgb(255, 0, 0)")).toStrictEqual([1, 0, 0]);
  });

  test("a translucent colour is read as nothing", () => {
    expect.hasAssertions();

    expect(parseRgbColor("rgba(0, 0, 0, 0)")).toBeUndefined();
  });

  test("a colour the browser computes in another space is read as nothing", () => {
    expect.hasAssertions();

    expect(parseRgbColor("oklch(0 0 0)")).toBeUndefined();
  });
});
