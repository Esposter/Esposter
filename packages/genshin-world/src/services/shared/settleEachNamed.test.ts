import { settleEachNamed } from "#src/services/shared/settleEachNamed";
import { describe, expect, test } from "vitest";

describe(settleEachNamed, () => {
  test("a failing item is named and skipped while the rest are read", async () => {
    expect.hasAssertions();

    const failingName = "broken";
    const settled = await settleEachNamed(
      ["first", failingName, "third"],
      (name) => name,
      (name) => {
        if (name === failingName) throw new Error("cannot be read");
        return Promise.resolve(name.toUpperCase());
      },
    );

    expect(settled).toStrictEqual({ failures: ["broken: cannot be read"], values: ["FIRST", "THIRD"] });
  });
});
