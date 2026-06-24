import type { FilesSource } from "@/models/source/FilesSource";

import { SourceType } from "@/models/source/SourceType";
import { loadFilesSource } from "@/services/source/loadFilesSource";
import { bench, describe } from "vitest";
// Micro counterpart to the macro gate (createVirrun.bench.ts). That gate is dominated by process
// Spawn (~100ms), so it cannot see the sandbox's own per-call work. This isolates the one source
// Loader that does real work scaling with untrusted input — loadFilesSource — with no spawn in the
// Way, so a regression in the per-file materialization cost (or its path-traversal guard) shows up.
// LoadDirSource is a no-op and loadGitSource spawns real git over the network, so neither is timed.
// Each iteration materializes then disposes so temp dirs never accumulate across samples.
const FILE_COUNTS = [1, 100, 1000];

const createFilesSource = (count: number): FilesSource => {
  const files: Record<string, string> = {};
  for (let i = 0; i < count; i++) files[`nested/file-${i}.txt`] = "";
  return { files, type: SourceType.Files };
};

describe("loadFilesSource — load + dispose by file count", () => {
  for (const count of FILE_COUNTS)
    bench(`files:${count}`, async () => {
      const { dispose } = await loadFilesSource(createFilesSource(count));
      await dispose();
    });
});
