import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { WIKI_FIXTURE_DIRECTORY } from "#src/services/genshinAssets/kits/wiki/constants.test";
import { parseAdvancedProperties } from "#src/services/genshinAssets/kits/wiki/parseAdvancedProperties";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const createRow = (row: number, title: string, poise: number): WikiAdvancedProperty => ({
  gauge: 1,
  internalCooldownTag: "Normal Attack",
  poise,
  row,
  title,
});

describe(parseAdvancedProperties, () => {
  test("reads Dough-Fu's rows as the wiki writes them, a field it leaves out undefined", () => {
    expect.hasAssertions();

    const wikitext = readFileSync(join(WIKI_FIXTURE_DIRECTORY, "Dough-Fu.wikitext"), "utf8");

    expect(parseAdvancedProperties(wikitext)).toStrictEqual([
      createRow(1, "Normal Attack 1-Hit", 16),
      createRow(2, "Normal Attack 2-Hit", 19.2),
      createRow(3, "Normal Attack 3-Hit A", 19.2),
      createRow(4, "Normal Attack 3-Hit B", 20),
      createRow(5, "Normal Attack 4-Hit A", 19.2),
      createRow(6, "Normal Attack 4-Hit B", 19.2),
      createRow(7, "Normal Attack 4-Hit C", 19.2),
      createRow(8, "Normal Attack 4-Hit D", 12.8),
      createRow(9, "Normal Attack 5-Hit", 71.2),
      { gauge: 1, internalCooldownTag: "Charged Attack", poise: 120, row: 10, title: "Charged Attack" },
      { gauge: 0, internalCooldownTag: "none", poise: 25, row: 11, title: "Plunging Attack Collision" },
      { gauge: 1, internalCooldownTag: "none", poise: 100, row: 12, title: "Low Plunge" },
      { gauge: 1, internalCooldownTag: "none", poise: 150, row: 13, title: "High Plunge" },
    ]);
  });

  test("numbers the rows on from one template to the next", () => {
    expect.hasAssertions();

    const template = "{{Advanced Properties\n|title = Swing DMG\n|poise = {{Tt|30|varies}}\n}}";

    expect(parseAdvancedProperties(`${template}\n${template}`)).toStrictEqual([
      { row: 1, title: "Swing DMG" },
      { row: 2, title: "Swing DMG" },
    ]);
  });

  test("numbers the next template on from its last row, a row the page leaves out included", () => {
    expect.hasAssertions();

    const gapped = "{{Advanced Properties\n|title = Swing DMG\n|title3 = Charge DMG\n}}";
    const next = "{{Advanced Properties\n|title = Plunge DMG\n}}";

    expect(parseAdvancedProperties(`${gapped}\n${next}`)).toStrictEqual([
      { row: 1, title: "Swing DMG" },
      { row: 3, title: "Charge DMG" },
      { row: 4, title: "Plunge DMG" },
    ]);
  });
});
