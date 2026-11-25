import type { Node } from "oxc-parser";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseSourceUnlinked } from "#src/services/shared/parseSourceUnlinked";
import { getDescendants } from "#src/services/sweeps/getDescendants";
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
    const constructors = getDescendants(parseSourceUnlinked(source)).filter(
      (node) => node.type === "NewExpression" && CONSTRUCTOR_TEXT_REGEX.test(source.slice(node.start, node.end)),
    );
    // A constructor nested in another's arguments is blanked out of that outer call's text,
    // So its protect option is not read as the outer's
    const getOwnText = (constructor: Node) =>
      constructors
        .filter((inner) => inner !== constructor && inner.start >= constructor.start && inner.end <= constructor.end)
        .reduce(
          (text, inner) =>
            `${text.slice(0, inner.start - constructor.start)}${" ".repeat(inner.end - inner.start)}${text.slice(inner.end - constructor.start)}`,
          source.slice(constructor.start, constructor.end),
        );
    return constructors.filter((constructor) => !PROTECT_REGEX.test(getOwnText(constructor))).length;
  };

  test("every resource the program constructs is protected", () => {
    expect.hasAssertions();

    const paths = readSweepFilePaths("apps/infra/src/**/*.ts");

    expect(
      paths.filter((path) => countUnprotectedConstructors(readFileSync(join(REPOSITORY_ROOT, path), "utf8")) > 0),
    ).toStrictEqual([]);
  });

  test("a protected constructor nested in another's arguments does not protect the outer one", () => {
    expect.hasAssertions();

    expect(
      countUnprotectedConstructors(
        'new github.Repository("r", {}, { dependsOn: [new github.IssueLabel("l", {}, { protect: true })] });',
      ),
    ).toBe(1);
  });
});
