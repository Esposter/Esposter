import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { parseDockerfileReferences } from "#src/services/outdatedDependencies/docker/parseDockerfileReferences";
import { describe, expect, test } from "vitest";

describe(parseDockerfileReferences, () => {
  const digest = `sha256:${"0".repeat(64)}`;

  test("reads an image pinned to a versioned tag and a digest", () => {
    expect.hasAssertions();

    expect(parseDockerfileReferences("", `FROM --platform=a host:0/a:v0.0.0-a@${digest} AS b\n`)).toStrictEqual({
      entries: [{ digest, group: DependencyGroup.Docker, packageName: "host:0/a", specifier: "v0.0.0-a" }],
      unpinned: [],
    });
  });

  test("reports a tag naming no version and a version with no digest as unpinned", () => {
    expect.hasAssertions();

    expect(parseDockerfileReferences("a", `FROM a:b@${digest}\nFROM a:0.0.0\n`)).toStrictEqual({
      entries: [],
      unpinned: [
        { packageName: `a:b@${digest}`, path: "a", reference: `a:b@${digest}` },
        { packageName: "a:0.0.0", path: "a", reference: "a:0.0.0" },
      ],
    });
  });

  test("skips an earlier stage and scratch", () => {
    expect.hasAssertions();

    expect(parseDockerfileReferences("", `FROM a:0.0.0@${digest} AS b\nFROM b\nFROM scratch\n`).unpinned).toStrictEqual(
      [],
    );
  });
});
