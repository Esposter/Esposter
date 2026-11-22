import { readWorkerSecrets } from "#src/services/workerSecrets/readWorkerSecrets";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(readWorkerSecrets, () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "read-worker-secrets-"));
  });

  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("reads a secret shaped like an ISO timestamp back as its string", () => {
    expect.hasAssertions();

    const file = join(directory, "secrets.json");
    const isoTimestamp = new Date(0).toISOString();
    writeFileSync(file, JSON.stringify({ a: isoTimestamp }));

    expect(readWorkerSecrets(file)).toStrictEqual({ a: isoTimestamp });
  });
});
