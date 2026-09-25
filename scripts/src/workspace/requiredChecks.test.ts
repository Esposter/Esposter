import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assert, describe, expect, test } from "vitest";

const readRepositoryFile = (path: string): string => readFileSync(join(REPOSITORY_ROOT, path), "utf8");

describe("requiredChecks", () => {
  // The branch ruleset requires each check by the name a CI job reports, and nothing else ties the two files: a
  // Context no job reports is never satisfied and blocks every merge, and a shard CI adds past the count is a check
  // The ruleset never asks for
  const rulesetSource = readRepositoryFile("apps/infra/src/github/rulesets/developMainStatusChecks.ts");
  const workflowSource = [".github/workflows/CI.yaml", ".github/workflows/build-packages.yaml"]
    .map((path) => readRepositoryFile(path))
    .join("\n");

  test("the ruleset requires one coverage context per CI shard", () => {
    expect.hasAssertions();

    const shards = /^\s+shard: \[(?<shards>[\d, ]+)\]$/mu.exec(readRepositoryFile(".github/workflows/CI.yaml"))?.groups
      ?.shards;
    const shardCount = /^const CoverageShardCount = (?<count>\d+);$/mu.exec(
      readRepositoryFile("apps/infra/src/github/constants/CoverageShardCount.ts"),
    )?.groups?.count;

    assert.exists(shards);
    assert.exists(shardCount);
    expect(shards.split(",")).toHaveLength(Number(shardCount));
  });

  test("every required context names a job the workflows define", () => {
    expect.hasAssertions();

    // A job's own name sits at the job's indent and a matrix job's at its `include` entries', so a step's name — which
    // Reports no check — never counts
    const jobNames = new Set(
      Array.from(workflowSource.matchAll(/^(?: {4}| {10}- )name: (?<name>.+)$/gmu), ({ groups }) => groups?.name),
    );
    // A reusable workflow reports under its caller's job id, so only the called job's own name is the workflow's
    const contexts = Array.from(
      rulesetSource.matchAll(/^\s+\{ context: "(?:[\w-]+ \/ )?(?<context>[^"]+)" \},$/gmu),
      ({ groups }) => groups?.context,
    );

    assert.isNotEmpty(contexts);
    expect(contexts.filter((context) => !jobNames.has(context))).toStrictEqual([]);
  });
});
