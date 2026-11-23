import type { TestSpecification, Vitest } from "vitest/node";

import { DurationSequencer } from "#src/services/DurationSequencer";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, test } from "vitest";

describe(DurationSequencer, () => {
  const root = mkdtempSync(join(tmpdir(), "duration-sequencer-"));
  const DURATIONS = { "a.test.ts": 9, "b.test.ts": 1, "c.test.ts": 4, "d.test.ts": 4 };
  const files = Object.keys(DURATIONS).map(
    (path) => ({ moduleId: join(root, path), project: { name: "project" } }) as TestSpecification,
  );
  const readShardModuleIds = async (index: number) => {
    const shardFiles = await new DurationSequencer({ config: { root, shard: { count: 2, index } } } as Vitest).shard(
      files,
    );
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
});
