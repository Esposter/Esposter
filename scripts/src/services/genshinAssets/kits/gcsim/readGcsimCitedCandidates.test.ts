import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { classifyKitValue } from "#src/services/genshinAssets/kits/record/classifyKitValue";
import { readGcsimCitedCandidates } from "#src/services/genshinAssets/kits/gcsim/readGcsimCitedCandidates";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const FOLDER = "aino";
const ASC_GO = "package aino\n\nfunc tick() {\n\tadd(1.5 * 60)\n}\n";

const createGcsimDirectory = () => {
  const directory = mkdtempSync(join(tmpdir(), "gcsim-cited-"));
  mkdirSync(join(directory, "internal", "characters", FOLDER), { recursive: true });
  writeFileSync(join(directory, "internal", "characters", FOLDER, "asc.go"), ASC_GO);
  return directory;
};

describe("readGcsimCitedCandidates", () => {
  test("a cited line that evaluates to the value gives a Gcsim candidate with that file and line", () => {
    expect.hasAssertions();
    const overlay: KitOverlay = {
      "frames.waterBallInterval": { file: "asc.go", line: 4, source: KitSource.Gcsim, value: 90 },
    };
    const candidate = readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get(
      "frames.waterBallInterval",
    )?.[0];
    expect(candidate?.value).toBe(90);
    expect(candidate?.provenance).toStrictEqual({
      file: "internal/characters/aino/asc.go",
      line: 4,
      source: KitSource.Gcsim,
    });
  });

  test("a cited line that does not give the value gives its first value, which compare names as DiffersFromSource", () => {
    expect.hasAssertions();
    const overlay: KitOverlay = {
      "frames.waterBallInterval": { file: "asc.go", line: 4, source: KitSource.Gcsim, value: 100 },
    };
    const candidates =
      readGcsimCitedCandidates(overlay, createGcsimDirectory(), FOLDER).get("frames.waterBallInterval") ?? [];
    expect(candidates[0]?.value).toBe(90);
    expect(classifyKitValue(100, candidates, [], false)).toStrictEqual({
      cause: KitProvisionalCause.DiffersFromSource,
      value: 100,
    });
  });
});
