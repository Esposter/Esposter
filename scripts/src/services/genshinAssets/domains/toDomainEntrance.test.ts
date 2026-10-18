import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";

import { toDomainEntrance } from "#src/services/genshinAssets/domains/toDomainEntrance";
import { GameTextKey } from "genshin-text";
import { DomainKind, LandmarkKind } from "genshin-world";
import { describe, expect, test } from "vitest";

const ORIGIN = [100, 20, 200] as const;
const createEntry = (overrides: Partial<ExcelDungeonEntryRow>): ExcelDungeonEntryRow => ({
  cooldownTipsDungeonId: [],
  descriptionCycleRewardList: [],
  dungeonEntryId: 7,
  id: 1,
  sceneId: 3,
  type: "DUNGEN_ENTRY_TYPE_RELIQUARY",
  ...overrides,
});

describe(toDomainEntrance, () => {
  test("a domain entrance takes its kind from its entry type and its place from its transport point, carried round the origin", () => {
    expect.hasAssertions();

    const point: DumpedScenePoint = {
      $type: "Point",
      titleTextID: GameTextKey.DomainEntrance24,
      tranPos: { x: 150, y: 30, z: 300 },
      tranRot: { y: 90 },
    };
    expect(toDomainEntrance(createEntry({}), point, ORIGIN)).toStrictEqual({
      domainKind: DomainKind.Blessing,
      entryId: 1,
      height: 30,
      id: "domain-entrance-1",
      kind: LandmarkKind.DomainEntrance,
      position: { x: 50, z: -100 },
      rotation: -1.5708,
      titleTextKey: GameTextKey.DomainEntrance24,
    });
  });

  test("a weekly boss's entry is a Trounce domain whatever its type, named by its own title", () => {
    expect.hasAssertions();

    const point: DumpedScenePoint = {
      $type: "Point",
      titleTextID: GameTextKey.DomainEntrance24,
      tranPos: { x: 150, y: 30, z: 300 },
      tranRot: { y: 90 },
    };
    expect(toDomainEntrance(createEntry({ id: 1006, type: "DUNGEON_ENTRY_TYPE_TRIAL" }), point, ORIGIN)).toStrictEqual({
      domainKind: DomainKind.Trounce,
      entryId: 1006,
      height: 30,
      id: "domain-entrance-1006",
      kind: LandmarkKind.DomainEntrance,
      position: { x: 50, z: -100 },
      rotation: -1.5708,
      titleTextKey: GameTextKey.DomainEntrance24,
    });
  });

  test("a zero component left out of the transport position reads as zero", () => {
    expect.hasAssertions();

    const point: DumpedScenePoint = {
      $type: "Point",
      titleTextID: GameTextKey.DomainEntrance24,
      tranPos: { y: 30, z: 300 },
      tranRot: { y: 60 },
    };
    expect(toDomainEntrance(createEntry({ type: "DUNGEN_ENTRY_TYPE_WEAPON_PROMOTE" }), point, ORIGIN)).toStrictEqual({
      domainKind: DomainKind.Forgery,
      entryId: 1,
      height: 30,
      id: "domain-entrance-1",
      kind: LandmarkKind.DomainEntrance,
      position: { x: -100, z: -100 },
      rotation: -1.0472,
      titleTextKey: GameTextKey.DomainEntrance24,
    });
  });

  test("a point with no turn faces zero, not negative zero", () => {
    expect.hasAssertions();

    const point: DumpedScenePoint = {
      $type: "Point",
      titleTextID: GameTextKey.DomainEntrance24,
      tranPos: { x: 150, y: 30, z: 300 },
    };
    expect(toDomainEntrance(createEntry({}), point, ORIGIN)?.rotation).toBe(0);
  });

  test("a normal entry gives no domain entrance", () => {
    expect.hasAssertions();

    const point: DumpedScenePoint = {
      $type: "Point",
      titleTextID: GameTextKey.DomainEntrance24,
      tranPos: { x: 150, y: 30, z: 300 },
    };
    expect(toDomainEntrance(createEntry({ type: "DUNGEON_ENTRY_TYPE_NORMAL" }), point, ORIGIN)).toBeUndefined();
  });

  test("an entry whose point is missing gives no domain entrance", () => {
    expect.hasAssertions();

    expect(toDomainEntrance(createEntry({}), undefined, ORIGIN)).toBeUndefined();
  });

  test("an entry whose point holds no transport position gives no domain entrance", () => {
    expect.hasAssertions();

    expect(toDomainEntrance(createEntry({}), { $type: "Point" }, ORIGIN)).toBeUndefined();
  });
});
