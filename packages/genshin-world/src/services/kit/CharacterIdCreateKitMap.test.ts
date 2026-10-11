import { CharacterIdCreateKitMap } from "#src/generated/characterKitMap/CharacterIdCreateKitMap";
import { describe, expect, test } from "vitest";

const CHARACTER_ID_SUFFIX = "_CHARACTER_ID";
const CREATE_KIT_PREFIX = "create";
const CREATE_KIT_SUFFIX = "Kit";

describe("generated character kit map", () => {
  test("holds every kit module keyed by the character id it declares, with no duplicate ids", () => {
    expect.hasAssertions();

    const kitModules = Object.values(
      import.meta.glob<Record<string, unknown>>("/src/services/kit/characters/*Kit.ts", { eager: true }),
    );
    const declaredIds = kitModules.flatMap((kitModule) => {
      const idName = Object.keys(kitModule).find((name) => name.endsWith(CHARACTER_ID_SUFFIX));
      const declaredId = idName ? kitModule[idName] : undefined;
      return typeof declaredId === "number" ? [declaredId] : [];
    });

    expect(declaredIds).toHaveLength(kitModules.length);
    expect(new Set(declaredIds).size).toBe(declaredIds.length);
    expect(
      Object.keys(CharacterIdCreateKitMap)
        .map(Number)
        .toSorted((firstId, secondId) => firstId - secondId),
    ).toStrictEqual(declaredIds.toSorted((firstId, secondId) => firstId - secondId));
  });

  test("maps each character id to its own module's create function", () => {
    expect.hasAssertions();

    const kitModules = Object.values(
      import.meta.glob<Record<string, unknown>>("/src/services/kit/characters/*Kit.ts", { eager: true }),
    );

    for (const kitModule of kitModules) {
      const idName = Object.keys(kitModule).find((name) => name.endsWith(CHARACTER_ID_SUFFIX));
      const createName = Object.keys(kitModule).find(
        (name) => name.startsWith(CREATE_KIT_PREFIX) && name.endsWith(CREATE_KIT_SUFFIX),
      );
      const characterId = idName ? kitModule[idName] : undefined;
      expect(characterId).toBeTypeOf("number");
      expect(CharacterIdCreateKitMap[Number(characterId)]).toBe(createName ? kitModule[createName] : undefined);
    }
  });
});
