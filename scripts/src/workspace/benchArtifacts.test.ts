import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * A bench is a speed gate only through the artifact it commits: the diff on `*.bench.md` is what a regression
 * shows up in (`bench` skill). A bench file that commits no report is a measurement nobody will ever compare
 * against — it runs, rewrites nothing, and reads as covered. A helper file — the
 * `describe.todo` beside an exported fixture or a shared registration, `testing` skill — registers no group of its
 * own and owes nothing, and a `*.platform.bench.ts` commits one pair per platform, so it owes at least one.
 */
describe("benchArtifacts", () => {
  const HELPER_REGEX = /describe\.todo\(/u;
  const BENCH_SUFFIX = ".bench.ts";
  const PLATFORM_MARKER = ".platform.bench.ts";
  const ARTIFACT_EXTENSIONS = ["json", "md"];
  // Registration is not greppable — a command bench registers through `setupCommandBench` — so the helper marker
  // Is the whole distinction: every other bench file is a bench
  const benchPaths = readSweepFilePaths("*.bench.ts").filter(
    (benchPath) => !HELPER_REGEX.test(readFileSync(resolve(REPOSITORY_ROOT, benchPath), "utf8")),
  );

  test("commits a report beside every bench", () => {
    expect.hasAssertions();

    const reportlessPaths = benchPaths.filter((benchPath) => {
      const isPlatform = benchPath.endsWith(PLATFORM_MARKER);
      const base = benchPath.slice(0, -BENCH_SUFFIX.length);
      const artifactPaths = ARTIFACT_EXTENSIONS.map((extension) =>
        isPlatform
          ? readSweepFilePaths(`${base}.bench.*.${extension}`)
          : [`${base}.bench.${extension}`].filter((artifactPath) => existsSync(resolve(REPOSITORY_ROOT, artifactPath))),
      );
      return artifactPaths.some((paths) => paths.length === 0);
    });

    expect(reportlessPaths).toStrictEqual([]);
  });

  // The discovery above is the whole test's reach, so a glob matching nothing would pass vacuously.
  test("finds the benches", () => {
    expect.hasAssertions();

    expect(benchPaths.length).toBeGreaterThan(0);
  });
});
