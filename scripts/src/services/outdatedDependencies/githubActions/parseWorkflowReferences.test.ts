import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { parseWorkflowReferences } from "#src/services/outdatedDependencies/githubActions/parseWorkflowReferences";
import { describe, expect, test } from "vitest";

describe(parseWorkflowReferences, () => {
  const sha = "0".repeat(40);
  const digest = `sha256:${"0".repeat(64)}`;

  test("reads an action pinned to a commit under its repository, with the tag from the comment", () => {
    expect.hasAssertions();

    expect(parseWorkflowReferences("", `      - uses: a/b/c@${sha} # v0.0.0\n`)).toStrictEqual({
      entries: [{ digest: sha, group: DependencyGroup.GitHubActions, packageName: "a/b", specifier: "v0.0.0" }],
      unpinned: [],
    });
  });

  test("reads a pinned docker image and a versioned runner", () => {
    expect.hasAssertions();

    expect(parseWorkflowReferences("", `    runs-on: a-0.0\n      - uses: docker://a:0.0.0@${digest}\n`)).toStrictEqual(
      {
        entries: [
          { digest, group: DependencyGroup.Docker, packageName: "a", specifier: "0.0.0" },
          { group: DependencyGroup.GitHubRunners, packageName: "a", specifier: "0.0" },
        ],
        unpinned: [],
      },
    );
  });

  test("skips a local action and a latest runner", () => {
    expect.hasAssertions();

    expect(parseWorkflowReferences("", "    runs-on: a-latest\n      - uses: ./a\n")).toStrictEqual({
      entries: [],
      unpinned: [],
    });
  });

  test("reports a ref with no commit, a commit with no version and an unreadable runner as unpinned", () => {
    expect.hasAssertions();

    expect(
      parseWorkflowReferences("a", `    runs-on: \${{ a }}\n    uses: a/b@c\n      - uses: a/b@${sha}\n`),
    ).toStrictEqual({
      entries: [],
      unpinned: [
        { packageName: "a/b", path: "a", reference: "a/b@c" },
        { packageName: "a/b", path: "a", reference: `a/b@${sha}` },
        { packageName: "${{", path: "a", reference: "runs-on: ${{" },
      ],
    });
  });
});
