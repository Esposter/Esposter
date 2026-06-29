import { BackendType } from "@/models/virrun/BackendType";
import { parseVirrunConfiguration } from "@/services/configuration/parseVirrunConfiguration";
import { describe, expect, test } from "vitest";

describe(parseVirrunConfiguration, () => {
  test("parses a full config", () => {
    expect.hasAssertions();

    const configuration = parseVirrunConfiguration(JSON.stringify({ backend: "os" }));

    expect(configuration).toStrictEqual({ backend: BackendType.Os });
  });

  test("defaults an omitted backend to auto", () => {
    expect.hasAssertions();

    expect(parseVirrunConfiguration("{}")).toStrictEqual({ backend: BackendType.Auto });
  });

  test("throws on invalid JSON", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration("{ not json")).toThrow("not valid JSON");
  });

  test("throws on an unknown backend", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration(JSON.stringify({ backend: "" }))).toThrow("`backend` must be one of");
  });

  test("throws on an unknown key", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration(JSON.stringify({ "": "" }))).toThrow("unknown key:");
  });

  test("accepts a $schema pointer", () => {
    expect.hasAssertions();

    expect(parseVirrunConfiguration(JSON.stringify({ $schema: "./schema.json", backend: "os" }))).toStrictEqual({
      backend: BackendType.Os,
    });
  });
});
