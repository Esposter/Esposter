import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// Every token's name is built by a naming helper from its responsibility, so it reads as the convention says. A literal
// Name is the one way a token falls outside the convention, and this test fails on any token whose name no helper
// Builds.
describe("cloudflareTokenNames", () => {
  // An environment's token passes its environment before its asset type, and an account's token starts with its asset
  // Type
  const TOKEN_NAME_REGEX =
    /new cloudflare\.AccountToken\(\s*getCloudflare(?:Account)?ResourceName\((?:\s*CloudflareEnvironment\.\w+,)?\s*CloudflareAssetType\.Token,/u;

  test("every account token is named by the naming helpers", () => {
    expect.hasAssertions();

    // A single `*` is the folder's own files: git's pathspec reads `accountTokens/**/*.ts` as a folder below it, which
    // Lists none
    const paths = readSweepFilePaths("apps/infra/src/cloudflare/resources/accountTokens/*.ts");

    expect(
      paths.filter((path) => !TOKEN_NAME_REGEX.test(readFileSync(join(REPOSITORY_ROOT, path), "utf8"))),
    ).toStrictEqual([]);
  });
});
