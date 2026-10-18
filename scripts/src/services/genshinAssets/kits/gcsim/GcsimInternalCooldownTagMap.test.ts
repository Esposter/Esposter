import { GCSIM_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { GcsimInternalCooldownTagMap } from "#src/services/genshinAssets/kits/gcsim/GcsimInternalCooldownTagMap";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const ICD_TAGS_FILE = join(GCSIM_CACHE_DIRECTORY, "pkg/core/attacks/icd_tags.dm.go");

describe("GcsimInternalCooldownTagMap", () => {
  test.skipIf(!existsSync(ICD_TAGS_FILE))("names every tag gcsim's enum declares, but None, with a map entry", () => {
    expect.hasAssertions();

    const gcsimTags = [...readFileSync(ICD_TAGS_FILE, "utf8").matchAll(/^\s*ICDTag([A-Za-z0-9]+)\b/gm)]
      .map((match) => match[1])
      .filter((name): name is string => name !== undefined && name !== "None");

    expect(gcsimTags.length).toBeGreaterThan(0);
    for (const name of gcsimTags) expect(`attacks.ICDTag${name}` in GcsimInternalCooldownTagMap, name).toBe(true);
  });
});
