import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";
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

  test("names every variable that fails in one error", () => {
    expect.hasAssertions();
    expect(() => {
      validateEnvironmentVariables(schema, {});
    }).toThrow(
      new InvalidOperationError(
        Operation.Read,
        "environment variables",
        "SECRET: Invalid input: expected string, received undefined; URL: Invalid input: expected string, received undefined",
      ),
    );
  });

  test("never quotes the value it rejected", () => {
    expect.hasAssertions();
    expect(() => {
      validateEnvironmentVariables(schema, { SECRET: "a", URL: "not-a-url-secret" });
    }).toThrow(new InvalidOperationError(Operation.Read, "environment variables", "URL: Invalid URL"));
  });
});
