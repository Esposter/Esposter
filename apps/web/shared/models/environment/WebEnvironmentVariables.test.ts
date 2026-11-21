import { webEnvironmentVariablesSchema } from "#shared/models/environment/WebEnvironmentVariables";
import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { describe, expect, test } from "vitest";

describe("webEnvironmentVariablesSchema", () => {
  test("declares exactly the variables .env.example names", () => {
    expect.hasAssertions();

    const names = Object.keys(parseEnv(readFileSync(join(import.meta.dirname, "../../../.env.example"), "utf8")));
    expect(names.toSorted()).toStrictEqual(Object.keys(webEnvironmentVariablesSchema.shape).toSorted());
  });

  test("uploads as Worker secrets exactly the variables it marks secret", () => {
    expect.hasAssertions();

    const workerSecrets = jsonDateParse<{ web: string[] }>(
      readFileSync(join(import.meta.dirname, "../../../../../.github/worker-secrets.json"), "utf8"),
    );
    const secretNames = Object.entries(webEnvironmentVariablesSchema.shape)
      .filter(([, schema]) => schema.meta()?.secret === true)
      .map(([name]) => name);
    expect(secretNames.toSorted()).toStrictEqual(workerSecrets.web.toSorted());
  });

  test("refuses an unset or empty TOPIC_WATCH_SECRET, which has no absent form", () => {
    expect.hasAssertions();

    const { TOPIC_WATCH_SECRET } = webEnvironmentVariablesSchema.shape;
    expect(() => TOPIC_WATCH_SECRET.parse(undefined)).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "expected": "string",
          "code": "invalid_type",
          "path": [],
          "message": "Invalid input: expected string, received undefined"
        }
      ]]
    `);
    expect(() => TOPIC_WATCH_SECRET.parse("")).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "origin": "string",
          "code": "too_small",
          "minimum": 1,
          "inclusive": true,
          "path": [],
          "message": "Too small: expected string to have >=1 characters"
        }
      ]]
    `);
  });
});
