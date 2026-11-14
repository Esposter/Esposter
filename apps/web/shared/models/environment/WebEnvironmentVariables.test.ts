import { webEnvironmentVariablesSchema } from "#shared/models/environment/WebEnvironmentVariables";
import { MOCK_ENVIRONMENT_VARIABLES } from "#shared/services/environment/constants.test";
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

    const workerSecrets: { web: string[] } = JSON.parse(
      readFileSync(join(import.meta.dirname, "../../../../../.github/worker-secrets.json"), "utf8"),
    );
    const secretNames = Object.entries(webEnvironmentVariablesSchema.shape)
      .filter(([, schema]) => schema.meta()?.secret === true)
      .map(([name]) => name);
    expect(secretNames.toSorted()).toStrictEqual(workerSecrets.web.toSorted());
  });

  test("accepts the mock environment every test runs against", () => {
    expect.hasAssertions();
    expect(webEnvironmentVariablesSchema.safeParse(MOCK_ENVIRONMENT_VARIABLES).success).toBe(true);
  });
});
