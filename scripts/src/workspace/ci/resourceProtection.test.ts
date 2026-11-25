import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A Pulumi replace or delete reaches a live bucket, zone or repository unless the resource is declared `protect: true`,
 * and nothing else reads a resource's options, so a constructor written without it is accepted silently. Every
 * constructor the program makes carries the option in the same file.
 */
describe("resourceProtection", () => {
  // One constructor per resource, from either provider namespace
  const CONSTRUCTOR_REGEX = /new (?:cloudflare|github)\.\w+\(/gu;
  const PROTECT_REGEX = /protect: true/gu;

  test("every resource the program constructs is protected", () => {
    expect.hasAssertions();

    const paths = readSweepFilePaths("apps/infra/src/**/*.ts");

    expect(
      paths.filter((path) => {
        const source = readFileSync(join(REPOSITORY_ROOT, path), "utf8");
        return (source.match(CONSTRUCTOR_REGEX)?.length ?? 0) > (source.match(PROTECT_REGEX)?.length ?? 0);
      }),
    ).toStrictEqual([]);
  });
});
