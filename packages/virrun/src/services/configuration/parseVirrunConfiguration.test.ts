import { BackendType } from "@/models/virrun/BackendType";
import { Environment } from "@/models/virrun/Environment";
import { parseVirrunConfiguration } from "@/services/configuration/parseVirrunConfiguration";
import { InvalidOperationError } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseVirrunConfiguration, () => {
  test("parses a full config", () => {
    expect.hasAssertions();

    const configuration = parseVirrunConfiguration(JSON.stringify({ backend: "os", environment: "nuxt" }));

    expect(configuration).toStrictEqual({ backend: BackendType.Os, environment: Environment.Nuxt });
  });

  test("defaults an omitted backend to auto and environment to none", () => {
    expect.hasAssertions();

    expect(parseVirrunConfiguration("{}")).toStrictEqual({
      backend: BackendType.Auto,
      environment: Environment.None,
    });
  });

  test("throws on invalid JSON", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration("{ not json")).toThrow(InvalidOperationError);
  });

  test("throws on an unknown backend", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration(JSON.stringify({ backend: "" }))).toThrow(InvalidOperationError);
  });

  test("throws on an unknown environment", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration(JSON.stringify({ environment: "" }))).toThrow(InvalidOperationError);
  });

  test("throws on an unknown key", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration(JSON.stringify({ "": "" }))).toThrow(InvalidOperationError);
  });

  test("accepts a $schema pointer", () => {
    expect.hasAssertions();

    expect(parseVirrunConfiguration(JSON.stringify({ $schema: "./schema.json", backend: "os" }))).toStrictEqual({
      backend: BackendType.Os,
      environment: Environment.None,
    });
  });
});
