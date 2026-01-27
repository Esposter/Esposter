import { generateToken } from "@@/server/services/auth/generateToken";
import { describe, expect, test } from "vitest";

describe(generateToken, () => {
  test("generates token", () => {
    expect.hasAssertions();

    expect(generateToken()).toHaveLength(64);
    expect(generateToken()).not.toBe(generateToken());
  });
});
