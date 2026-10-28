import { CharacterIdCreateKitBehaviourMap } from "#src/generated/characterKitMap/CharacterIdCreateKitBehaviourMap";
import { describe, expect, test } from "vitest";

describe("generated character kit behaviour map", () => {
  const CHARACTER_ID_SUFFIX = "_CHARACTER_ID";
  const CREATE_KIT_PREFIX = "create";
  const CREATE_KIT_SUFFIX = "KitBehaviour";

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
      Object.keys(CharacterIdCreateKitBehaviourMap)
        .map(Number)
        .toSorted((firstId, secondId) => firstId - secondId),
    ).toStrictEqual(declaredIds.toSorted((firstId, secondId) => firstId - secondId));
  });

  test("loads each character id's own module's behaviour", async () => {
    expect.hasAssertions();

    const kitModules = Object.values(
      import.meta.glob<Record<string, unknown>>("/src/services/kit/characters/*Kit.ts", { eager: true }),
    );

    await Promise.all(
      kitModules.map(async (kitModule) => {
        const idName = Object.keys(kitModule).find((name) => name.endsWith(CHARACTER_ID_SUFFIX));
        const createName = Object.keys(kitModule).find(
          (name) => name.startsWith(CREATE_KIT_PREFIX) && name.endsWith(CREATE_KIT_SUFFIX),
        );
        const characterId = idName ? kitModule[idName] : undefined;
        expect(characterId).toBeTypeOf("number");
        await expect(CharacterIdCreateKitBehaviourMap[Number(characterId)]?.()).resolves.toBe(
          createName ? kitModule[createName] : undefined,
        );
      }),
    );
  });
});
