import { describe, expect, test } from "vitest";

import { veilText } from "./veilText";

describe(veilText, () => {
  test.each([
    ["a@b.co", "[email]"],
    ["$29", "[amount]"],
    ["€1,299.50", "[amount]"],
    ["12 USD", "[amount]"],
    ["+1 555 123 4567", "[phone]"],
    ["555-123-4567", "[phone]"],
    ["sk-ant-0123456789abcdef", "[secret]"],
    ["ghp_0123456789abcdefABCD", "[secret]"],
    ["0123456789abcdef0123456789abcdef", "[secret]"],
    ["password=a", "password=[secret]"],
  ])("veils %s", (text, placeholder) => {
    expect.hasAssertions();

    expect(veilText(`x ${text} y`)).toBe(`x ${placeholder} y`);
  });

  test.each([
    new Date(0).toISOString().slice(0, 10),
    "192.168.1.1",
    "v1.2.3",
    "port 3000",
    "packages/genshin-mods/src/register.ts",
  ])("leaves %s as it is", (text) => {
    expect.hasAssertions();

    expect(veilText(text)).toBe(text);
  });
});
