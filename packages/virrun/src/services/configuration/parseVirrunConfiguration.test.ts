import { BackendType } from "#src/models/virrun/BackendType";
import { Environment } from "#src/models/virrun/Environment";
import { parseVirrunConfiguration } from "#src/services/configuration/parseVirrunConfiguration";
import { InvalidOperationError } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseVirrunConfiguration, () => {
  test("parses a full config", () => {
    expect.hasAssertions();

    const configuration = parseVirrunConfiguration({ backend: "os", environment: "nuxt" });

    expect(configuration).toStrictEqual({ backend: BackendType.Os, environment: Environment.Nuxt });
  });

  test(`defaults an omitted backend to ${BackendType.Os} and leaves an omitted environment undefined (no preset)`, () => {
    expect.hasAssertions();

    expect(parseVirrunConfiguration({})).toStrictEqual({ backend: BackendType.Os });
  });

  test("throws on a non-object value", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration("os")).toThrow(InvalidOperationError);
  });

  test("throws on an unknown backend", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration({ backend: "" })).toThrow(InvalidOperationError);
  });

  test("throws on an unknown environment", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration({ environment: "" })).toThrow(InvalidOperationError);
  });

  test("throws on the removed 'none' environment — absence is expressed by omitting the key, not a none value", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration({ environment: "none" })).toThrow(InvalidOperationError);
  });

  test("throws on an unknown key", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration({ "": "" })).toThrow(InvalidOperationError);
  });

  test("accepts a $schema pointer", () => {
    expect.hasAssertions();

    expect(parseVirrunConfiguration({ $schema: "./schema.json", backend: "os" })).toStrictEqual({
      backend: BackendType.Os,
    });
  });
});
