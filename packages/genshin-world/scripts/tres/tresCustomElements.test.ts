import { tresCustomElements } from "#scripts/tres/tresCustomElements";
import { describe, expect, test } from "vitest";

describe("tresCustomElements", () => {
  test.each(["TresMesh", "tres-*", "primitive"])("lists %s", (tag) => {
    expect.hasAssertions();

    expect(tresCustomElements).toContain(tag);
  });

  test.each(["TresCanvas", "TresScene"])("leaves out %s, which stays a component", (tag) => {
    expect.hasAssertions();

    expect(tresCustomElements).not.toContain(tag);
  });
});
