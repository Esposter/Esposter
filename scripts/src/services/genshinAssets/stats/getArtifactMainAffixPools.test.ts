import type { ExcelReliquaryMainPropRow } from "#src/models/genshinAssets/stats/ExcelReliquaryMainPropRow";

import { getArtifactMainAffixPools } from "#src/services/genshinAssets/stats/getArtifactMainAffixPools";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { ArtifactSlot, Attribute } from "genshin-world/definitions";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/genshinText/readExcelTable"));

describe(getArtifactMainAffixPools, () => {
  const CIRCLET_DEPOT = 3000;
  const FLOWER_DEPOT = 4000;
  const GOBLET_DEPOT = 5000;
  const PLUME_DEPOT = 2000;
  const SANDS_DEPOT = 1000;
  const slotMainPropDepots = new Map<ArtifactSlot, number>([
    [ArtifactSlot.CircletOfLogos, CIRCLET_DEPOT],
    [ArtifactSlot.FlowerOfLife, FLOWER_DEPOT],
    [ArtifactSlot.GobletOfEonothem, GOBLET_DEPOT],
    [ArtifactSlot.PlumeOfDeath, PLUME_DEPOT],
    [ArtifactSlot.SandsOfEon, SANDS_DEPOT],
  ]);

  test("each slot's pool holds the attributes its depot holds that its main affix can be, in the depot's order", () => {
    expect.hasAssertions();

    // The depots list the flat attributes and the resistances the game never rolls on the slot as its main affix, which
    // The pools leave out
    const rows: ExcelReliquaryMainPropRow[] = [
      { id: 14_001, propDepotId: FLOWER_DEPOT, propType: "FIGHT_PROP_HP" },
      { id: 12_001, propDepotId: PLUME_DEPOT, propType: "FIGHT_PROP_ATTACK" },
      { id: 10_001, propDepotId: SANDS_DEPOT, propType: "FIGHT_PROP_HP" },
      { id: 10_002, propDepotId: SANDS_DEPOT, propType: "FIGHT_PROP_HP_PERCENT" },
      { id: 10_003, propDepotId: SANDS_DEPOT, propType: "FIGHT_PROP_ATTACK" },
      { id: 10_004, propDepotId: SANDS_DEPOT, propType: "FIGHT_PROP_ATTACK_PERCENT" },
      { id: 10_005, propDepotId: SANDS_DEPOT, propType: "FIGHT_PROP_DEFENSE" },
      { id: 10_006, propDepotId: SANDS_DEPOT, propType: "FIGHT_PROP_DEFENSE_PERCENT" },
      { id: 10_007, propDepotId: SANDS_DEPOT, propType: "FIGHT_PROP_CHARGE_EFFICIENCY" },
      { id: 10_008, propDepotId: SANDS_DEPOT, propType: "FIGHT_PROP_ELEMENT_MASTERY" },
      { id: 10_009, propDepotId: SANDS_DEPOT, propType: "FIGHT_PROP_FIRE_SUB_HURT" },
      { id: 15_002, propDepotId: GOBLET_DEPOT, propType: "FIGHT_PROP_HP" },
      { id: 15_003, propDepotId: GOBLET_DEPOT, propType: "FIGHT_PROP_HP_PERCENT" },
      { id: 15_004, propDepotId: GOBLET_DEPOT, propType: "FIGHT_PROP_ATTACK" },
      { id: 15_005, propDepotId: GOBLET_DEPOT, propType: "FIGHT_PROP_ATTACK_PERCENT" },
      { id: 15_006, propDepotId: GOBLET_DEPOT, propType: "FIGHT_PROP_DEFENSE_PERCENT" },
      { id: 15_007, propDepotId: GOBLET_DEPOT, propType: "FIGHT_PROP_ELEMENT_MASTERY" },
      { id: 15_008, propDepotId: GOBLET_DEPOT, propType: "FIGHT_PROP_FIRE_ADD_HURT" },
      { id: 15_009, propDepotId: GOBLET_DEPOT, propType: "FIGHT_PROP_PHYSICAL_ADD_HURT" },
      { id: 13_001, propDepotId: CIRCLET_DEPOT, propType: "FIGHT_PROP_HP" },
      { id: 13_002, propDepotId: CIRCLET_DEPOT, propType: "FIGHT_PROP_HP_PERCENT" },
      { id: 13_003, propDepotId: CIRCLET_DEPOT, propType: "FIGHT_PROP_ATTACK" },
      { id: 13_004, propDepotId: CIRCLET_DEPOT, propType: "FIGHT_PROP_ATTACK_PERCENT" },
      { id: 13_005, propDepotId: CIRCLET_DEPOT, propType: "FIGHT_PROP_DEFENSE" },
      { id: 13_006, propDepotId: CIRCLET_DEPOT, propType: "FIGHT_PROP_DEFENSE_PERCENT" },
      { id: 13_007, propDepotId: CIRCLET_DEPOT, propType: "FIGHT_PROP_CRITICAL" },
      { id: 13_008, propDepotId: CIRCLET_DEPOT, propType: "FIGHT_PROP_CRITICAL_HURT" },
      { id: 13_009, propDepotId: CIRCLET_DEPOT, propType: "FIGHT_PROP_HEAL_ADD" },
      { id: 13_010, propDepotId: CIRCLET_DEPOT, propType: "FIGHT_PROP_ELEMENT_MASTERY" },
    ];
    vi.mocked(readExcelTable).mockReturnValue(rows);

    expect(getArtifactMainAffixPools(slotMainPropDepots)).toStrictEqual([
      {
        attributes: [
          Attribute.HealthPercent,
          Attribute.AttackPercent,
          Attribute.DefensePercent,
          Attribute.CriticalRate,
          Attribute.CriticalDamage,
          Attribute.HealingBonus,
          Attribute.ElementalMastery,
        ],
        slot: ArtifactSlot.CircletOfLogos,
      },
      { attributes: [Attribute.Health], slot: ArtifactSlot.FlowerOfLife },
      {
        attributes: [
          Attribute.HealthPercent,
          Attribute.AttackPercent,
          Attribute.DefensePercent,
          Attribute.ElementalMastery,
          Attribute.PyroDamageBonus,
          Attribute.PhysicalDamageBonus,
        ],
        slot: ArtifactSlot.GobletOfEonothem,
      },
      { attributes: [Attribute.Attack], slot: ArtifactSlot.PlumeOfDeath },
      {
        attributes: [
          Attribute.HealthPercent,
          Attribute.AttackPercent,
          Attribute.DefensePercent,
          Attribute.EnergyRecharge,
          Attribute.ElementalMastery,
        ],
        slot: ArtifactSlot.SandsOfEon,
      },
    ]);
  });
});
