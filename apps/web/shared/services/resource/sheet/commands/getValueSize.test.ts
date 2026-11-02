import { getValueSize } from "#shared/services/resource/sheet/commands/getValueSize";
import { describe, expect, test } from "vitest";

describe(getValueSize, () => {
  test("counts the UTF-8 bytes of the stored text, so a character outside ASCII takes more than one", () => {
    expect.hasAssertions();

    expect(getValueSize("中")).toBe(5);
  });
});
