import { blueprintParameterSchema } from "#shared/models/resource/blueprint/BlueprintParameter";
import { describe, expect, test } from "vitest";

describe("blueprintParameterSchema", () => {
  // An empty choice list is refused as too small, naming the list, not as a default that is not one of its values
  test("refuses an empty allowedValues list at the list itself", () => {
    expect.hasAssertions();

    const result = blueprintParameterSchema.safeParse({ allowedValues: [], defaultValue: "", key: "region" });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map(({ code, path }) => ({ code, path }))).toContainEqual({
      code: "too_small",
      path: ["allowedValues"],
    });
  });
});
