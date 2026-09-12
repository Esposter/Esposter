import { BackendType } from "#src/models/virrun/BackendType";
import { Environment } from "#src/models/virrun/Environment";
import { parseVirrunConfiguration } from "#src/services/configuration/parseVirrunConfiguration";
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

    expect(() => parseVirrunConfiguration("os")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseVirrunConfiguration, ✖ Invalid input: expected object, received string]`,
    );
  });

  test("throws on an unknown backend", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration({ backend: "" })).toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: parseVirrunConfiguration, ✖ Invalid option: expected one of "auto"|"native"|"os"|"vfs"
        → at backend]
    `);
  });

  test("throws on an unknown environment", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration({ environment: "" })).toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: parseVirrunConfiguration, ✖ Invalid input: expected "nuxt"
        → at environment]
    `);
  });

  test("throws on the removed 'none' environment — absence is expressed by omitting the key, not a none value", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration({ environment: "none" })).toThrowErrorMatchingInlineSnapshot(`
      [InvalidOperationError: Invalid operation: Read, name: parseVirrunConfiguration, ✖ Invalid input: expected "nuxt"
        → at environment]
    `);
  });

  test("throws on an unknown key", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration({ "": "" })).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseVirrunConfiguration, ✖ Unrecognized key: ""]`,
    );
  });

  test("accepts a $schema pointer", () => {
    expect.hasAssertions();

    expect(parseVirrunConfiguration({ $schema: "./schema.json", backend: "os" })).toStrictEqual({
      backend: BackendType.Os,
    });
  });
});
