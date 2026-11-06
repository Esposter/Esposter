import { checkAcceptedType } from "#src/services/checkAcceptedType";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(checkAcceptedType, () => {
  test("a refusal names the accepted types in the order they are given", () => {
    expect.hasAssertions();

    const { error } = z
      .string()
      .superRefine((type, context) => {
        checkAcceptedType(context, type, ["section", "heading"], []);
      })
      .safeParse("list");

    expect(error?.issues.map(({ message }) => message)).toStrictEqual(["type must be one of section, heading"]);
  });
});
