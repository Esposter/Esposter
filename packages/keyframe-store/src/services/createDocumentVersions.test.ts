import { describe } from "vitest";

interface DocumentVersionsOptions {
  // How many cells change between one version and the next
  editCount: number;
  rowCount: number;
  seed: number;
  versionCount: number;
}

// A linear congruential generator, so a corpus is a function of its seed and every byte count a suite snapshots
// Is reproducible
const createRandom = (seed: number) => {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 0x1_0000_0000;
  };
};

// A working session over a tabular document — the shape the store exists for — as the serialized bytes of
// Each successive version. Every version differs from the one before it by `editCount` cells, so a suite can
// Ask what a small edit, a broad edit or a wholesale rewrite (a different seed) costs to store
export const createDocumentVersions = ({
  editCount,
  rowCount,
  seed,
  versionCount,
}: DocumentVersionsOptions): Uint8Array[] => {
  const random = createRandom(seed);
  const rows = Array.from({ length: rowCount }, (_, index) => ({
    id: index,
    name: `row ${index}`,
    value: random().toString(),
  }));
  const versions = [Buffer.from(JSON.stringify(rows))];
  for (let version = 1; version < versionCount; version++) {
    for (let edit = 0; edit < editCount; edit++) {
      const row = rows[Math.floor(random() * rowCount)];
      if (row) row.value = random().toString();
    }
    versions.push(Buffer.from(JSON.stringify(rows)));
  }
  return versions;
};

describe.todo("createDocumentVersions");
