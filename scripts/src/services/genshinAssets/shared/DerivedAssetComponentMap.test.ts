import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { assert, describe, expect, test, vi } from "vitest";

describe("derived asset component map", () => {
  const windriseStreamedPrefabs =
    DerivedAssetComponentMap[DerivedAssetComponent.Windrise].world?.streams.flatMap(({ prefabs }) => prefabs) ?? [];

  test("imports without the weapon roots record, so the command that rewrites it can still run", async () => {
    expect.hasAssertions();

    vi.resetModules();
    vi.doMock(import("#src/services/genshinAssets/weapons/readWeaponRoots"), () => ({
      readWeaponRoots: () => {
        throw new Error("no weapon roots record");
      },
    }));
    const { DerivedAssetComponentMap: lazyMap } =
      await import("#src/services/genshinAssets/shared/DerivedAssetComponentMap");

    expect(() => lazyMap[DerivedAssetComponent.Weapons].roots).toThrowErrorMatchingInlineSnapshot(
      `[Error: no weapon roots record]`,
    );
    vi.doUnmock(import("#src/services/genshinAssets/weapons/readWeaponRoots"));
    vi.resetModules();
  });

  test("roots the player's girl at her model prefab in the block the animator reads", () => {
    expect.hasAssertions();

    expect(DerivedAssetComponentMap[DerivedAssetComponent.PlayerGirl].roots).toStrictEqual([
      { block: "00/02666572.blk", name: "Avatar_Girl_Sword_PlayerGirl_Model", pathId: "7275937277578795946" },
    ]);
  });

  test("a streamed object stands where the game places it, the Windrise dais's stair among them", () => {
    expect.hasAssertions();

    expect(windriseStreamedPrefabs).toContainEqual({
      prefab: { block: "00/05652564.blk", name: "Area_Common_Build_Plinth_E_01_Lod0", pathId: "-2383471818772636885" },
      prefabId: 2_068_799_372,
    });
    expect(windriseStreamedPrefabs).toContainEqual({
      prefab: { block: "00/05652564.blk", name: "Area_Common_Build_Plinth_E_02_Lod0", pathId: "-4253360323365887065" },
      prefabId: 2_068_796_237,
    });
    expect(windriseStreamedPrefabs).toContainEqual({
      prefab: { block: "00/03851813.blk", name: "Area_Common_Build_Stair_A_01_Lod0", pathId: "-3545738691652725999" },
      prefabId: 2_751_255_372,
    });
  });

  test("names the animals: the `Animal_` models and the `Ani_Animal_` clips, fish and pets among them", () => {
    expect.hasAssertions();

    const { clipPattern, namePattern } = DerivedAssetComponentMap[DerivedAssetComponent.Animals];

    assert.exists(clipPattern);
    assert.exists(namePattern);
    const nameRegExp = new RegExp(namePattern, "u");
    const clipRegExp = new RegExp(clipPattern, "u");

    expect("Animal_Squirrel_01_Model").toMatch(nameRegExp);
    expect("Animal_Fish_Model").toMatch(nameRegExp);
    expect("Animal_Cat_Cassiodo_Scarf_Model").toMatch(nameRegExp);
    expect("Ani_Animal_Fox_01_Scared").toMatch(clipRegExp);
    expect("Ani_Animal_Fish_01_Run").toMatch(clipRegExp);
    expect("FishingRod_Normal_Ukai_01_Model").not.toMatch(nameRegExp);
  });

  test("names the fishing scene: the rod, the float, the cast and the rod's clips, never the animals", () => {
    expect.hasAssertions();

    const { clipPattern, namePattern } = DerivedAssetComponentMap[DerivedAssetComponent.Fishing];

    assert.exists(clipPattern);
    assert.exists(namePattern);
    const nameRegExp = new RegExp(namePattern, "u");
    const clipRegExp = new RegExp(clipPattern, "u");

    expect("FishingRod_Normal_Ukai_01_Model").toMatch(nameRegExp);
    expect("Eff_Avatar_Fishing_Cork").toMatch(nameRegExp);
    expect("SkillObj_Fishing_Cast").toMatch(nameRegExp);
    expect("Ani_FishingRod_Normal_Cast_AS").toMatch(clipRegExp);
    expect("Animal_Fishable_Maritime_EffectMesh").not.toMatch(nameRegExp);
    expect("Ani_Animal_Fish_01_Run").not.toMatch(clipRegExp);
  });
});
