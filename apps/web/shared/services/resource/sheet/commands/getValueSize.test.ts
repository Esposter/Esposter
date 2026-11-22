import { getValueSize } from "#shared/services/resource/sheet/commands/getValueSize";
import { describe, expect, test } from "vitest";

describe(getValueSize, () => {
  test("counts the UTF-8 bytes of the stored text, so a character outside ASCII takes more than one", () => {
    expect.hasAssertions();

    expect(getValueSize("é")).toBe(4);
    expect(getValueSize("中")).toBe(5);
  });

  test("counts a character outside the basic plane as four bytes and an escaped lone surrogate as its escape", () => {
    expect.hasAssertions();

    expect(getValueSize("😀")).toBe(6);
    expect(getValueSize("\uD800")).toBe(8);
  });
});
