import { GCSIM_CACHE_DIRECTORY, GCSIM_COOLDOWN_TAG_PREFIX } from "#src/services/genshinAssets/kits/constants";
import { GcsimInternalCooldownTagMap } from "#src/services/genshinAssets/kits/gcsim/GcsimInternalCooldownTagMap";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("gcsimInternalCooldownTagMap", () => {
  const ICD_TAGS_FILE = join(GCSIM_CACHE_DIRECTORY, "pkg/core/attacks/icd_tags.dm.go");

  test.skipIf(!existsSync(ICD_TAGS_FILE))("names every tag gcsim's enum declares, but None, with a map entry", () => {
    expect.hasAssertions();

    const gcsimTags = Array.from(
      readFileSync(ICD_TAGS_FILE, "utf8").matchAll(/^\s*ICDTag(?<name>[A-Za-z0-9]+)\b/gmu),
      (match) => match.groups?.name,
    ).filter((name): name is string => name !== undefined && name !== "None");

    expect(gcsimTags.length).toBeGreaterThan(0);
    const unmappedTags = gcsimTags.filter(
      (name) => !(`${GCSIM_COOLDOWN_TAG_PREFIX}${name}` in GcsimInternalCooldownTagMap),
    );
    expect(unmappedTags).toStrictEqual([]);
  });
});
