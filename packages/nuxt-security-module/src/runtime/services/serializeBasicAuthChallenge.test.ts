import { serializeBasicAuthChallenge } from "#src/runtime/services/serializeBasicAuthChallenge";
import { describe, expect, test } from "vitest";

describe(serializeBasicAuthChallenge, () => {
  test("a realm is written as a quoted string", () => {
    expect.hasAssertions();

    expect(serializeBasicAuthChallenge("Staff")).toBe('Basic realm="Staff"');
  });

  test("a quote in the realm is escaped, so the realm cannot close itself and add a parameter", () => {
    expect.hasAssertions();

    expect(serializeBasicAuthChallenge('Staff" realm="admin')).toBe(String.raw`Basic realm="Staff\" realm=\"admin"`);
  });
});
