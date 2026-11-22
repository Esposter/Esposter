import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getWorkerSecretFailures } from "#src/services/workerSecrets/getWorkerSecretFailures";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { jobsEnvironmentVariablesSchema } from "../../../../apps/jobs/src/models/environment/JobsEnvironmentVariables.ts";
import { webEnvironmentVariablesSchema } from "../../../../apps/web/shared/models/environment/WebEnvironmentVariables.ts";

describe(getWorkerSecretFailures, () => {
  const workerSecrets = parseMachineJson<{ web: string[] }>(
    readFileSync(join(import.meta.dirname, "../../../../.github/worker-secrets.json"), "utf8"),
  );
  const webSecrets = Object.fromEntries(workerSecrets.web.map((name) => [name, " "]));

  test("refuses an empty value for a secret the schema requires non-empty, by its name and zod code", () => {
    expect.hasAssertions();

    expect(
      getWorkerSecretFailures(jobsEnvironmentVariablesSchema, { VAPID_PRIVATE_KEY: "", VAPID_PUBLIC_KEY: " " }),
    ).toStrictEqual(["VAPID_PRIVATE_KEY: too_small"]);
  });

  test("passes the web Worker's uploaded set once every secret has a value", () => {
    expect.hasAssertions();

    expect(getWorkerSecretFailures(webEnvironmentVariablesSchema, webSecrets)).toStrictEqual([]);
  });
});
