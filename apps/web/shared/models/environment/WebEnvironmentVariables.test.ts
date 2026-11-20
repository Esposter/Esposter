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

  test("reads an unset or empty TOPIC_WATCH_SECRET as the one absent form, the empty string", () => {
    expect.hasAssertions();

    const { TOPIC_WATCH_SECRET } = webEnvironmentVariablesSchema.shape;
    expect(TOPIC_WATCH_SECRET.parse(undefined)).toBe("");
    expect(TOPIC_WATCH_SECRET.parse("")).toBe("");
  });
});
