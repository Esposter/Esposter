// @vitest-environment happy-dom
import { readBrowserColor } from "@/services/pageBuilder/readBrowserColor";
import { describe, expect, test } from "vitest";

describe(readBrowserColor, () => {
  test("an unreadable colour is reported unchecked", () => {
    expect.hasAssertions();

    expect(readBrowserColor("")).toBeUndefined();
  });

  test("a colour the browser computes in rgb is read as its sRGB channels", () => {
    expect.hasAssertions();

    expect(readBrowserColor("rgb(255, 0, 0)")).toStrictEqual([1, 0, 0]);
  });
});
