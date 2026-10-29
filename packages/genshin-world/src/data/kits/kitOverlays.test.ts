import { englishNameText } from "#parity/englishNameText";
import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { characterDataSchema } from "#src/models/character/CharacterData";
import { kitRecordSchema } from "#src/models/kit/record/KitRecord";
import { readGameData } from "#src/services/data/readGameData";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { readGameDataIndex } from "#src/services/data/readGameDataIndex";
import { expandKitOverlay } from "#src/services/kit/expandKitOverlay";
import { toKebabCase } from "@esposter/shared";
import { basename } from "node:path";
import { assert, describe, expect, test } from "vitest";
import { z } from "zod";

describe("kitOverlays", () => {
  const overlayPathMap = import.meta.glob<Record<string, { cause?: string; value?: unknown }>>(
    "#src/data/kits/*.json",
    { eager: true, import: "default" },
  );

  test("every value a committed overlay holds, or holds absent, is its published record's at its path", async () => {
    expect.hasAssertions();

    const [characters, kitIndex] = await Promise.all([
      readGameData(GAME_DATA_LOCAL_BASE_URL, "stats/characters", z.array(characterDataSchema)),
      readGameDataIndex(GAME_DATA_LOCAL_BASE_URL, "kits"),
    ]);
    const kitCharacterIds = Object.keys(kitIndex);
    const overlayNameCharacterIdMap = new Map(
      characters
        .filter(({ id }) => kitCharacterIds.includes(String(id)))
        .map(({ id, nameTextId }) => [toKebabCase(englishNameText[nameTextId] ?? ""), String(id)]),
    );
    const valuePairs = await Promise.all(
      Object.entries(overlayPathMap).map(async ([overlayPath, overlay]) => {
        const overlayName = basename(overlayPath, ".json");
        const characterId = overlayNameCharacterIdMap.get(overlayName);
        assert.exists(characterId, overlayName);
        const record = await readGameDataEntry(GAME_DATA_LOCAL_BASE_URL, "kits", characterId, kitRecordSchema);
        // An entry naming a source chooses among the sources' values rather than holding one
        return Object.entries(expandKitOverlay(overlay))
          .filter(([, entry]) => entry.cause !== undefined && !("donor" in entry))
          .map(([valuePath, { value }]) => ({
            committed: [`${overlayName}:${valuePath}`, value],
            published: [
              `${overlayName}:${valuePath}`,
              valuePath
                .split(".")
                .reduce<unknown>((parent, key) => (parent as Record<string, unknown> | undefined)?.[key], record),
            ],
          }));
      }),
    );

    expect(Object.fromEntries(valuePairs.flat().map(({ published }) => published))).toStrictEqual(
      Object.fromEntries(valuePairs.flat().map(({ committed }) => committed)),
    );
  });
});
