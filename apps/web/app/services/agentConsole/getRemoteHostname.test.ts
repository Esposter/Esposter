import { getRemoteHostname } from "@/services/agentConsole/getRemoteHostname";
import { describe, expect, test } from "vitest";

describe(getRemoteHostname, () => {
  test.each([
    ["ws://127.0.0.1:0/", ""],
    ["ws://localhost:0/", ""],
    ["ws://a:0/", "a"],
    // Links crafted to read as this computer while pointing at another are still warned about
    ["ws://localhost.a:0/", "localhost.a"],
    ["ws://127.0.0.1.a:0/", "127.0.0.1.a"],
    ["ws://127.0.0.1@a:0/", "a"],
    ["", ""],
  ])("reads %s as %j", (hostUrl, expected) => {
    expect.hasAssertions();

    expect(getRemoteHostname(hostUrl)).toBe(expected);
  });
});
