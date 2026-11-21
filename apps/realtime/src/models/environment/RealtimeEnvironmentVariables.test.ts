import { realtimeEnvironmentVariablesSchema } from "#src/models/environment/RealtimeEnvironmentVariables";
import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { describe, expect, test } from "vitest";

describe("the Realtime environment", () => {
  test("declares exactly the variables .env.example names", () => {
    expect.hasAssertions();

    const names = Object.keys(parseEnv(readFileSync(join(import.meta.dirname, "../../../.env.example"), "utf8")));
    expect(names.toSorted()).toStrictEqual(Object.keys(realtimeEnvironmentVariablesSchema.shape).toSorted());
  });

  test("uploads as Worker secrets exactly the variables it marks secret", () => {
    expect.hasAssertions();

    const workerSecrets = jsonDateParse<{ realtime: string[] }>(
      readFileSync(join(import.meta.dirname, "../../../../../.github/worker-secrets.json"), "utf8"),
    );
    const secretNames = Object.entries(realtimeEnvironmentVariablesSchema.shape)
      .filter(([, schema]) => schema.meta()?.secret === true)
      .map(([name]) => name);
    expect(secretNames.toSorted()).toStrictEqual(workerSecrets.realtime.toSorted());
  });

  test.each(["REALTIMEKIT_API_TOKEN", "REALTIMEKIT_APP_ID"] as const)(
    "reads an unset or empty %s as the empty string, the one absent form ESC's empty secret uploads as",
    (name) => {
      expect.hasAssertions();

      const field = realtimeEnvironmentVariablesSchema.shape[name];
      expect(field.parse(undefined)).toBe("");
      expect(field.parse("")).toBe("");
    },
  );

  test("refuses an unset or empty TOPIC_WATCH_SECRET, which has no absent form", () => {
    expect.hasAssertions();

    const { TOPIC_WATCH_SECRET } = realtimeEnvironmentVariablesSchema.shape;
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
