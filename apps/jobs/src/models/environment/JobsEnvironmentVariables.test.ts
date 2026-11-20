import { jobsEnvironmentVariablesSchema } from "#src/models/environment/JobsEnvironmentVariables";
import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { describe, expect, test } from "vitest";

describe("the Jobs environment", () => {
  test("declares exactly the variables .env.example names", () => {
    expect.hasAssertions();

    const envExampleContent = readFileSync(join(import.meta.dirname, "../../../.env.example"), "utf8");
    const names = Object.keys(parseEnv(envExampleContent));
    expect(names.toSorted()).toStrictEqual(Object.keys(jobsEnvironmentVariablesSchema.shape).toSorted());
  });

  test("uploads as Worker secrets exactly the variables it marks secret", () => {
    expect.hasAssertions();

    const workerSecretsContent = readFileSync(
      join(import.meta.dirname, "../../../../../.github/worker-secrets.json"),
      "utf8",
    );
    const workerSecrets = jsonDateParse<{ jobs: string[] }>(workerSecretsContent);
    const secretNames = Object.entries(jobsEnvironmentVariablesSchema.shape)
      .filter(([, schema]) => schema.meta()?.secret === true)
      .map(([name]) => name);
    expect(secretNames.toSorted()).toStrictEqual(workerSecrets.jobs.toSorted());
  });
});
