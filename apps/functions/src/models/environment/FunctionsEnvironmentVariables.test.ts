import { functionsEnvironmentVariablesSchema } from "#src/models/environment/FunctionsEnvironmentVariables";
import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { describe, expect, test } from "vitest";

describe("the Functions environment", () => {
  test("declares exactly the variables .env.example names", () => {
    expect.hasAssertions();

    const names = Object.keys(parseEnv(readFileSync(join(import.meta.dirname, "../../../.env.example"), "utf8")));
    expect(names.toSorted()).toStrictEqual(Object.keys(functionsEnvironmentVariablesSchema.shape).toSorted());
  });

  test("uploads as Worker secrets exactly the variables it marks secret", () => {
    expect.hasAssertions();

    const workerSecrets = jsonDateParse<{ functions: string[] }>(
      readFileSync(join(import.meta.dirname, "../../../../../.github/worker-secrets.json"), "utf8"),
    );
    const secretNames = Object.entries(functionsEnvironmentVariablesSchema.shape)
      .filter(([, schema]) => schema.meta()?.secret === true)
      .map(([name]) => name);
    expect(secretNames.toSorted()).toStrictEqual(workerSecrets.functions.toSorted());
  });
});
