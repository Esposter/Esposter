import { getBasicAuthOptions } from "#src/runtime/services/getBasicAuthOptions";
import { describe, expect, test } from "vitest";

describe(getBasicAuthOptions, () => {
  test("basic auth switched off is no options", () => {
    expect.hasAssertions();

    expect(getBasicAuthOptions({ basicAuth: false })).toBeUndefined();
  });

  test("a config with no options, or with a name that is not a string, is no options", () => {
    expect.hasAssertions();

    expect(getBasicAuthOptions({})).toBeUndefined();
    expect(getBasicAuthOptions({ basicAuth: { name: 1, pass: "pass" } })).toBeUndefined();
  });

  test("valid options are returned, with an optional field only when it is set", () => {
    expect.hasAssertions();

    expect(getBasicAuthOptions({ basicAuth: { include: ["/a"], name: "user", pass: "pass" } })).toStrictEqual({
      include: ["/a"],
      name: "user",
      pass: "pass",
    });
  });
});
