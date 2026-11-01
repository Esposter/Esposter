import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Nitro runs the app's own `server/middleware` files before every middleware a module registers, the security module's
 * request size limiter included, and `addServerHandler` has no option to go first. A body one of them reads is read
 * before the limit wraps it, so the limit would not apply to that read.
 */
describe("serverMiddlewareBody", () => {
  const BODY_READ_REGEX =
    /\b(?:readBody|readFormData|readMultipartFormData|readRawBody|readValidatedBody)\b|\.(?:arrayBuffer|blob|bytes|formData|json|text)\(\)|\.body\b/u;

  test("no server middleware file reads a request body", () => {
    expect.hasAssertions();

    const readingFiles = readSweepFilePaths("apps/web/server/middleware").filter((path) =>
      BODY_READ_REGEX.test(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")),
    );

    expect(readingFiles).toStrictEqual([]);
  });
});
