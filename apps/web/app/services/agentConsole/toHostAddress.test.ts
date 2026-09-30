import { toHostAddress } from "@/services/agentConsole/toHostAddress";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(toHostAddress, () => {
  test.each([
    [`https://a.ts.net${RoutePath.Genshin}`, "wss://a.ts.net"],
    ["http://a:1", "ws://a:1"],
    ["wss://a", "wss://a"],
    ["ftp://a", ""],
    ["a", ""],
  ])("reads %s as %j", (typedAddress, expected) => {
    expect.hasAssertions();

    expect(toHostAddress(typedAddress)).toBe(expected);
  });
});
