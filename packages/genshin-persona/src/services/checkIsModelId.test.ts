import { checkIsModelId } from "#src/services/checkIsModelId";
import { describe, expect, test } from "vitest";

describe(checkIsModelId, () => {
  test.each([0, 1])("accepts %j", (modelId) => {
    expect.hasAssertions();

    expect(checkIsModelId(modelId)).toBe(true);
  });

  test.each([-1, 0.5, Number.NaN])("rejects %j", (modelId) => {
    expect.hasAssertions();

    expect(checkIsModelId(modelId)).toBe(false);
  });
});
