import type { DumpedEntryPoint } from "#src/models/genshinAssets/domains/DumpedEntryPoint";
import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";

import { toDomainEntrance } from "#src/services/genshinAssets/domains/toDomainEntrance";
import { DomainKind, LandmarkKind } from "genshin-world";
import { describe, expect, test } from "vitest";

const ORIGIN = [100, 20, 200] as const;
const createEntry = (overrides: Partial<ExcelDungeonEntryRow>): ExcelDungeonEntryRow => ({
  dungeonEntryId: 7,
  id: 1,
  sceneId: 3,
  type: "DUNGEN_ENTRY_TYPE_RELIQUARY",
  ...overrides,
});

describe(toDomainEntrance, () => {
  test("a domain entrance takes its kind from its entry type and its place from its transport point, carried round the origin", () => {
    expect.hasAssertions();

    const point: DumpedEntryPoint = { tranPos: { x: 150, y: 30, z: 300 }, tranRot: { y: 90 } };
    expect(toDomainEntrance(createEntry({}), point, ORIGIN)).toStrictEqual({
      domainKind: DomainKind.Blessing,
      entryId: 1,
      height: 30,
      id: "domain-entrance-1",
      kind: LandmarkKind.DomainEntrance,
      position: { x: 50, z: -100 },
      rotation: -1.5708,
    });
  });

  test("a zero component left out of the transport position reads as zero", () => {
    expect.hasAssertions();

    const point: DumpedEntryPoint = { tranPos: { y: 30, z: 300 }, tranRot: { y: 60 } };
    expect(toDomainEntrance(createEntry({ type: "DUNGEN_ENTRY_TYPE_WEAPON_PROMOTE" }), point, ORIGIN)).toStrictEqual({
      domainKind: DomainKind.Forgery,
      entryId: 1,
      height: 30,
      id: "domain-entrance-1",
      kind: LandmarkKind.DomainEntrance,
      position: { x: -100, z: -100 },
      rotation: -1.0472,
    });
  });

  test("a point with no turn faces zero, not negative zero", () => {
    expect.hasAssertions();

    const point: DumpedEntryPoint = { tranPos: { x: 150, y: 30, z: 300 } };
    expect(toDomainEntrance(createEntry({}), point, ORIGIN)?.rotation).toBe(0);
  });

  test("a normal entry gives no domain entrance", () => {
    expect.hasAssertions();

    const point: DumpedEntryPoint = { tranPos: { x: 150, y: 30, z: 300 } };
    expect(toDomainEntrance(createEntry({ type: "DUNGEON_ENTRY_TYPE_NORMAL" }), point, ORIGIN)).toBeUndefined();
  });

  test("an entry whose point is missing gives no domain entrance", () => {
    expect.hasAssertions();

    expect(toDomainEntrance(createEntry({}), undefined, ORIGIN)).toBeUndefined();
  });

  test("an entry whose point holds no transport position gives no domain entrance", () => {
    expect.hasAssertions();

    expect(toDomainEntrance(createEntry({}), {}, ORIGIN)).toBeUndefined();
  });
});
