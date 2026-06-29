import { BackendType } from "@/models/virrun/BackendType";
import { parseVirrunConfiguration } from "@/services/configuration/parseVirrunConfiguration";
import { describe, expect, test } from "vitest";

describe(parseVirrunConfiguration, () => {
  test("parses a full config", () => {
    expect.hasAssertions();

    const configuration = parseVirrunConfiguration(JSON.stringify({ backend: "os", fallback: "native" }));

    expect(configuration).toStrictEqual({ backend: BackendType.Os, fallback: BackendType.Native });
  });

  test("defaults omitted fields to an auto backend and native fallback", () => {
    expect.hasAssertions();

    expect(parseVirrunConfiguration("{}")).toStrictEqual({
      backend: BackendType.Auto,
      fallback: BackendType.Native,
    });
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
      fallback: BackendType.Native,
    });
  });
});
