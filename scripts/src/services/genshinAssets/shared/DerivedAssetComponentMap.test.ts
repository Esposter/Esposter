import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { DerivedAssetComponentMap } from "#src/services/genshinAssets/shared/DerivedAssetComponentMap";
import { readWeaponRoots } from "#src/services/genshinAssets/weapons/readWeaponRoots";
import { describe, expect, test, vi } from "vitest";

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

  test("roots the weapons at the prefabs `weapon-roots` derived", () => {
    expect.hasAssertions();

    const { roots } = DerivedAssetComponentMap[DerivedAssetComponent.Weapons];

    expect(roots).toStrictEqual(readWeaponRoots());
  });

  test("a streamed object stands where the game places it", () => {
    expect.hasAssertions();

    expect(windriseStreamedPrefabs).toContainEqual({
      prefab: { block: "00/05652564.blk", name: "Area_Common_Build_Plinth_E_01_Lod0", pathId: "-2383471818772636885" },
      prefabId: 2_068_799_372,
    });
    expect(windriseStreamedPrefabs).toContainEqual({
      prefab: { block: "00/05652564.blk", name: "Area_Common_Build_Plinth_E_02_Lod0", pathId: "-4253360323365887065" },
      prefabId: 2_068_796_237,
    });
  });

  test("the dais in Windrise stands at its place", () => {
    expect.hasAssertions();

    expect(windriseStreamedPrefabs).toContainEqual({
      prefab: { block: "00/03851813.blk", name: "Area_Common_Build_Stair_A_01_Lod0", pathId: "-3545738691652725999" },
      prefabId: 2_751_255_372,
    });
  });
});
