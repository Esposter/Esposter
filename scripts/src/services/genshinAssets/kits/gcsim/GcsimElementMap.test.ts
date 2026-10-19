import { GCSIM_CACHE_DIRECTORY, GCSIM_ELEMENTLESS_ELEMENTS } from "#src/services/genshinAssets/kits/constants";
import { GcsimElementMap } from "#src/services/genshinAssets/kits/gcsim/GcsimElementMap";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("gcsimElementMap", () => {
  const ELEMENT_FILE = join(GCSIM_CACHE_DIRECTORY, "pkg/core/attributes/element.go");
  // The aura states in gcsim's enum, which no attack is dealt as, so no kit element names them
  const AURA_STATE_NAMES: ReadonlySet<string> = new Set(["Frozen", "Quicken"]);

  test.skipIf(!existsSync(ELEMENT_FILE))(
    "names every element gcsim's enum declares, but the aura states, with a map entry or as element-less",
    () => {
      expect.hasAssertions();

      const gcsimElements = Array.from(
        readFileSync(ELEMENT_FILE, "utf8").matchAll(/^\t(?<name>[A-Z][A-Za-z]*)\b/gmu),
        (match) => match.groups?.name,
      ).filter((name): name is string => name !== undefined && !AURA_STATE_NAMES.has(name));

      expect(gcsimElements.length).toBeGreaterThan(0);
      const unmappedElements = gcsimElements.filter((name) => {
        const literal = `attributes.${name}`;
        return !(literal in GcsimElementMap) && !GCSIM_ELEMENTLESS_ELEMENTS.has(literal);
      });
      expect(unmappedElements).toStrictEqual([]);
    },
  );
});
