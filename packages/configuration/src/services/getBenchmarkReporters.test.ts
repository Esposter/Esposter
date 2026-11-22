// oxlint-disable no-restricted-properties -- the suite sets the argv Vitest itself is started with, which is what it reads
import { getBenchmarkReporters } from "#src/services/getBenchmarkReporters";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(getBenchmarkReporters, () => {
  const ORIGINAL_ARGV = process.argv;

  afterEach(() => {
    process.argv = ORIGINAL_ARGV;
    vi.unstubAllEnvs();
  });

  test("reports through the colocated reporter on a bench run", () => {
    expect.hasAssertions();

    process.argv = ["", "", "bench"];

    expect(getBenchmarkReporters()).toStrictEqual(["default", "@esposter/shared-node/reporter"]);
  });

  // A smoke run's results are one sample each, and the colocated reporter would write them over the committed ones
  test("reports through Vitest's own reporter alone on a smoke run", () => {
    expect.hasAssertions();

    process.argv = ["", "", "bench"];
    vi.stubEnv("BENCHMARK_SMOKE_RUN", "true");

    expect(getBenchmarkReporters()).toStrictEqual(["default"]);
  });

  // The word reaches argv as a filter and as a project name too, and either would hand an ordinary run the
  // Reporter that rewrites every `*.bench.md` it passes, plus the hour-long timeout a bench is allowed.
  test.each([
    ["run", "bench"],
    ["--project", "bench"],
    ["watch", "a.bench.ts"],
  ])("leaves Vitest's own reporters in place for `vitest %s %s`", (...commandArguments) => {
    expect.hasAssertions();

    process.argv = ["", "", ...commandArguments];

    expect(getBenchmarkReporters()).toBeUndefined();
  });
});
