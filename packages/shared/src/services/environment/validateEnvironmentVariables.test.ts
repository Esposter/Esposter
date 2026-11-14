import { validateEnvironmentVariables } from "#src/services/environment/validateEnvironmentVariables";
import { describe, expect, test } from "vitest";
import { z } from "zod";

describe(validateEnvironmentVariables, () => {
  const schema = z.object({ SECRET: z.string().min(1), URL: z.url() });

  test("accepts an environment that satisfies the schema", () => {
    expect.hasAssertions();
    expect(() => {
      validateEnvironmentVariables(schema, { SECRET: "a", URL: "https://example.com" });
    }).not.toThrow();
  });

  test("returns the parsed environment it accepted", () => {
    expect.hasAssertions();
    expect(validateEnvironmentVariables(schema, { SECRET: "a", URL: "https://example.com" })).toStrictEqual({
      SECRET: "a",
      URL: "https://example.com",
    });
  });

  test("names every variable that fails in one error", () => {
    expect.hasAssertions();
    expect(() => {
      validateEnvironmentVariables(schema, {});
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: environment variables, SECRET: Invalid input: expected string, received undefined; URL: Invalid input: expected string, received undefined]`,
    );
  });

  test("never quotes the value it rejected", () => {
    expect.hasAssertions();
    expect(() => {
      validateEnvironmentVariables(schema, { SECRET: "a", URL: "not-a-url-secret" });
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: environment variables, URL: Invalid URL]`,
    );
  });
});
