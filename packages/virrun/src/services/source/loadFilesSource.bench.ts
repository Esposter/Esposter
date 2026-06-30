import type { FilesSource } from "@/models/source/FilesSource";

import { SourceType } from "@/models/source/SourceType";
import { loadFilesSource } from "@/services/source/loadFilesSource";
import { bench, describe } from "vitest";
// Micro counterpart to the macro createVirrun.bench gate, which is dominated by ~100ms process spawn and so
// Can't see per-call work. Isolates loadFilesSource — the one loader whose cost scales with untrusted input
// (loadDirSource is a no-op, loadGitSource spawns networked git) — so a materialization or path-guard
// Regression shows. Each iteration disposes so temp dirs don't accumulate.
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
