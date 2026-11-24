import type { TestSpecification, Vitest } from "vitest/node";

import { DurationSequencer } from "#src/services/DurationSequencer";
import { TEST_FILENAME } from "#src/services/fixtureConstants.test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, test } from "vitest";

describe(DurationSequencer, () => {
  const root = mkdtempSync(join(tmpdir(), "duration-sequencer-"));
  const DURATIONS = { "a.test.ts": 9, "b.test.ts": 1, "c.test.ts": 4, "d.test.ts": 4 };
  const SHARED_PATH = join(TEST_FILENAME, `${TEST_FILENAME}.test.ts`);
  const files = Object.keys(DURATIONS).map(
    (path) => ({ moduleId: join(root, path), project: { name: "project" } }) as TestSpecification,
  );
  const readShardFiles = (index: number, specs: TestSpecification[]) =>
    new DurationSequencer({ config: { root, shard: { count: 2, index } } } as Vitest).shard(specs);
  const readShardModuleIds = async (index: number) => {
    const shardFiles = await readShardFiles(index, files);
    return shardFiles.map(({ moduleId }) => moduleId);
  };

  mkdirSync(join(root, ".vitest"));
  writeFileSync(
    join(root, ".vitest/timings.json"),
    JSON.stringify({
      projects: {
        project: {
          files: Object.fromEntries(Object.entries(DURATIONS).map(([path, duration]) => [path, { duration }])),
        },
        // Both projects hold the shared module at the heaviest file's time, so its two specs tie with it
        "": { files: { [SHARED_PATH]: { duration: 9 } } },
        " ": { files: { [SHARED_PATH]: { duration: 9 } } },
      },
    }),
  );

  afterAll(() => {
    rmSync(root, { force: true, recursive: true });
  });

  test("gives every file to exactly one shard, balancing their recorded durations", async () => {
    expect.hasAssertions();

    expect([await readShardModuleIds(1), await readShardModuleIds(2)]).toStrictEqual([
      [join(root, "a.test.ts")],
      [join(root, "b.test.ts"), join(root, "c.test.ts"), join(root, "d.test.ts")],
    ]);
  });

  test("splits a module two projects both hold the same way whatever order the files arrive in", async () => {
    expect.hasAssertions();

    const shared = ["", " "].map(
      (name) => ({ moduleId: join(root, SHARED_PATH), project: { name } }) as TestSpecification,
    );
    const forward = [...files, ...shared];

    const expected = await readShardFiles(1, forward);

    await expect(readShardFiles(1, forward.toReversed())).resolves.toStrictEqual(expected);
  });
});
