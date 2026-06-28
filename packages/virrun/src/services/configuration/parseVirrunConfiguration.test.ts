import { BackendType } from "@/models/virrun/BackendType";
import { parseVirrunConfiguration } from "@/services/configuration/parseVirrunConfiguration";
import { describe, expect, test } from "vitest";

describe(parseVirrunConfiguration, () => {
  test("parses a full config", () => {
    expect.hasAssertions();

    const configuration = parseVirrunConfiguration(
      JSON.stringify({ backend: "os", fallback: "native", route: ["vitest"] }),
    );

    expect(configuration).toStrictEqual({ backend: BackendType.Os, fallback: BackendType.Native, route: ["vitest"] });
  });

  test("defaults omitted fields to an auto backend, native fallback, and no routes", () => {
    expect.hasAssertions();

    expect(parseVirrunConfiguration("{}")).toStrictEqual({
      backend: BackendType.Auto,
      fallback: BackendType.Native,
      route: [],
    });
  });

  test("throws on invalid JSON", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration("{ not json")).toThrow("not valid JSON");
  });

  test("throws on an unknown backend", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration(JSON.stringify({ backend: "rocket" }))).toThrow("`backend` must be one of");
  });

  test("throws when route is not an array of strings", () => {
    expect.hasAssertions();

    expect(() => parseVirrunConfiguration(JSON.stringify({ route: [1, 2] }))).toThrow(
      "`route` must be an array of strings",
    );
  });
});
