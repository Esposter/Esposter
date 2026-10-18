import type { AttributeLine } from "#src/models/character/AttributeLine";

import { Attribute } from "#src/models/character/Attribute";

// The constant stats of the Benedictions the tower buff table gives, keyed by the buff's id, each read off its description in
// The game's text: the stat to every character of the party for the chamber, at the amount the description gives. PROVISIONAL:
// The published choices carry no modifier, so this table is the only source of the stat. A Benediction it does not hold gives
// No line, and the ones it leaves unbuilt are named in the change's design
const TOWER_BUFF_ID_ATTRIBUTE_LINES_MAP: Readonly<Record<number, AttributeLine[]>> = {
  1: [{ attribute: Attribute.AttackPercent, value: 0.2 }],
  2: [
    { attribute: Attribute.CriticalRate, value: 0.08 },
    { attribute: Attribute.CriticalDamage, value: 0.15 },
  ],
  3: [{ attribute: Attribute.PhysicalDamageBonus, value: 0.25 }],
  4: [{ attribute: Attribute.ElementalMastery, value: 80 }],
  5: [{ attribute: Attribute.EnergyRecharge, value: 0.2 }],
  6: [{ attribute: Attribute.DefensePercent, value: 0.3 }],
  7: [{ attribute: Attribute.HealthPercent, value: 0.25 }],
  8: [{ attribute: Attribute.PyroResistance, value: 0.35 }],
  9: [{ attribute: Attribute.HydroResistance, value: 0.35 }],
  10: [{ attribute: Attribute.CryoResistance, value: 0.35 }],
  11: [{ attribute: Attribute.AnemoResistance, value: 0.35 }],
  12: [{ attribute: Attribute.ElectroResistance, value: 0.35 }],
  13: [{ attribute: Attribute.GeoResistance, value: 0.35 }],
  14: [{ attribute: Attribute.DendroResistance, value: 0.35 }],
  15: [
    { attribute: Attribute.AnemoResistance, value: 0.25 },
    { attribute: Attribute.CryoResistance, value: 0.25 },
    { attribute: Attribute.DendroResistance, value: 0.25 },
    { attribute: Attribute.ElectroResistance, value: 0.25 },
    { attribute: Attribute.GeoResistance, value: 0.25 },
    { attribute: Attribute.HydroResistance, value: 0.25 },
    { attribute: Attribute.PyroResistance, value: 0.25 },
  ],
  16: [{ attribute: Attribute.PhysicalResistance, value: 0.3 }],
  22: [{ attribute: Attribute.HealingBonus, value: 0.2 }],
  28: [
    { attribute: Attribute.DefensePercent, value: -0.15 },
    { attribute: Attribute.AttackPercent, value: 0.4 },
  ],
  38: [{ attribute: Attribute.CooldownReduction, value: 0.2 }],
};

// The attribute lines of a Benediction by its tower buff id, empty for one the table leaves unbuilt
export const getAbyssBenedictionAttributeLines = (towerBuffId: number): AttributeLine[] =>
  TOWER_BUFF_ID_ATTRIBUTE_LINES_MAP[towerBuffId] ?? [];
