import type { Node } from "oxc-parser";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getChildren } from "#src/services/shared/getChildren";
import { parseSourceUnlinked } from "#src/services/shared/parseSourceUnlinked";
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
  const CONSTRUCTOR_TEXT_REGEX = /^new (?:cloudflare|github)\.\w+\(/u;
  const PROTECT_REGEX = /protect: true/u;

  // The constructor calls whose own text holds no `protect: true`, counted per call, so a protected sibling
  // Cannot cover for one that is not in the same file
  const countUnprotectedConstructors = (source: string) => {
    const countInNode = (node: Node): number => {
      const text = source.slice(node.start, node.end);
      const ownCount = CONSTRUCTOR_TEXT_REGEX.test(text) && !PROTECT_REGEX.test(text) ? 1 : 0;
      return getChildren(node).reduce((count, child) => count + countInNode(child), ownCount);
    };
    return countInNode(parseSourceUnlinked(source));
  };

  test("every resource the program constructs is protected", () => {
    expect.hasAssertions();

    const paths = readSweepFilePaths("apps/infra/src/**/*.ts");

    expect(
      paths.filter((path) => countUnprotectedConstructors(readFileSync(join(REPOSITORY_ROOT, path), "utf8")) > 0),
    ).toStrictEqual([]);
  });
});
