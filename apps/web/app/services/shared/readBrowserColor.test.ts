// @vitest-environment happy-dom
import { readBrowserColor } from "@/services/shared/readBrowserColor";
import { describe, expect, test } from "vitest";

describe(readBrowserColor, () => {
  test("a value the browser refuses reads as nothing", () => {
    expect.hasAssertions();

    expect(readBrowserColor("")).toBeUndefined();
  });
});
