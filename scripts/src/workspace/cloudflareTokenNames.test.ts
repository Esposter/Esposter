import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// Every token's name is built by a naming helper from its responsibility, so it reads as the convention says.
// A literal name is the one way a token falls outside the convention, and this test fails on any token whose name no helper builds.
describe("cloudflareTokenNames", () => {
  const TOKEN_NAME_REGEX =
    /new cloudflare\.AccountToken\(\s*getCloudflare(?:Account)?ResourceName\(\s*CloudflareAssetType\.Token,/u;

  test("every account token is named by the naming helpers", () => {
    expect.hasAssertions();

    const paths = readSweepFilePaths("apps/infra/src/cloudflare/resources/accountTokens/**/*.ts");

    expect(
      paths.filter((path) => !TOKEN_NAME_REGEX.test(readFileSync(join(REPOSITORY_ROOT, path), "utf8"))),
    ).toStrictEqual([]);
  });
});
