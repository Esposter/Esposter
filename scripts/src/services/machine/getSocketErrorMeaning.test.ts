import { SocketErrorMeaning } from "#src/models/machine/SocketErrorMeaning";
import { getSocketErrorMeaning } from "#src/services/machine/getSocketErrorMeaning";
import { describe, expect, test } from "vitest";

describe(getSocketErrorMeaning, () => {
  test.each([
    ["EADDRINUSE", SocketErrorMeaning.Contended],
    ["ECONNREFUSED", SocketErrorMeaning.Refused],
    ["ENOENT", SocketErrorMeaning.Absent],
    ["EACCES", SocketErrorMeaning.Unknown],
  ])("reads a %s error as %s", (code, meaning) => {
    expect.hasAssertions();

    expect(getSocketErrorMeaning(Object.assign(new Error(code), { code }))).toBe(meaning);
  });

  test("reads an error with no code as unknown", () => {
    expect.hasAssertions();

    expect(getSocketErrorMeaning(new Error("no code"))).toBe(SocketErrorMeaning.Unknown);
  });
});
