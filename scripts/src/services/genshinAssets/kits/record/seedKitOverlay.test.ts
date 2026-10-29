import type { KitOverlay } from "#src/models/shared/KitOverlay";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { kitOverlaySchema } from "#src/models/shared/KitOverlay";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { seedKitOverlay } from "#src/services/genshinAssets/kits/record/seedKitOverlay";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { expandKitOverlay } from "genshin-world";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe(seedKitOverlay, () => {
  const COMMITTED: KitOverlay = {
    "hits.fatalBlossoms.0-6.element": { cause: KitProvisionalCause.Unsourced, value: "Rock" },
    "hits.fatalBlossoms.0-6.hitmarkFrames": {
      file: "burst.go",
      line: 96,
      source: KitSource.Gcsim,
      value: [145, 150, 155, 160, 165, 170, 175],
    },
  };

  test("a seeding write of an overlay holding a range key gives the same bytes back", () => {
    expect.hasAssertions();

    const directory = mkdtempSync(join(tmpdir(), "seed-overlay-"));
    const committedPath = join(directory, "committed.json");
    const savedPath = join(directory, "saved.json");
    writeJsonFile(committedPath, COMMITTED);
    const committed = kitOverlaySchema.parse(parseMachineJson(readFileSync(committedPath, "utf8")));
    // A seeding write holds every path the expanded overlay gives, each with its index
    writeJsonFile(savedPath, seedKitOverlay(committed, expandKitOverlay(committed)));
    expect(readFileSync(savedPath, "utf8")).toBe(readFileSync(committedPath, "utf8"));
  });

  test("a seeded path the committed overlay does not cover is added, and no index is written", () => {
    expect.hasAssertions();

    const directory = mkdtempSync(join(tmpdir(), "seed-overlay-"));
    const savedPath = join(directory, "saved.json");
    const seeded: KitOverlay = {
      ...expandKitOverlay(COMMITTED),
      "frames.burstDuration": { cause: KitProvisionalCause.Unclassified, value: 70 },
    };
    writeJsonFile(savedPath, seedKitOverlay(COMMITTED, seeded));
    const saved = readFileSync(savedPath, "utf8");
    expect(saved).toContain('"frames.burstDuration"');
    expect(saved).toContain('"hits.fatalBlossoms.0-6.hitmarkFrames"');
    expect(saved).not.toContain('"index"');
  });
});
