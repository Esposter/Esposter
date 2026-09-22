import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { assert, describe, expect, test } from "vitest";

// Every line of a job's `if:` block, which is every line of the filter and nothing else — the surrounding
// Comments and keys carry no event expression
const readFilterLines = (name: string): string[] =>
  readFileSync(join(REPOSITORY_ROOT, ".github/workflows", name), "utf8")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("(github.event"));

describe("eventFilter", () => {
  // The filter is written twice and the copies must say one thing. The caller's is what frees the concurrency
  // Slot — an event it rejects starts no called workflow, where a called job that skips takes the group's one
  // Pending run and evicts the fire waiting in it — and the called workflow's is the pinned copy, which filters
  // The events read from `main`'s copy of the caller over the release a change to the filter takes to reach
  // Them. A second copy that says something else is the skip the first one exists to prevent.
  test("the runner spells one event filter in both workflow files", () => {
    expect.hasAssertions();

    const callerLines = readFilterLines("ReviewCollector.yaml");

    // Two files that both lost the filter would agree on nothing at all
    assert.isNotEmpty(callerLines);
    expect(readFilterLines("run-review-collector.yaml")).toStrictEqual(callerLines);
  });
});
