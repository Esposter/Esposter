import type { KitScaling } from "#src/models/genshinAssets/kits/module/KitScaling";
import type { CharacterAttributes, Combatant, Kit } from "genshin-world";
import type { Except } from "type-fest";

import { getResult } from "@esposter/shared";
import { Attribute, Attributes } from "genshin-world";

// The stats a kit's hit scales with, and the field of a striker's attributes that holds each where one does
const SCALING_ATTRIBUTES: readonly Attribute[] = [
  Attribute.Attack,
  Attribute.Defense,
  Attribute.ElementalMastery,
  Attribute.Health,
];
const ScalingAttributeFieldMap: Partial<Record<Attribute, keyof Except<CharacterAttributes, "attributeTotalMap">>> = {
  [Attribute.Attack]: "attack",
  [Attribute.Defense]: "defense",
  [Attribute.Health]: "maxHealth",
};
// A striker with none of its passives and constellations and one with all of them, so a function gated on either is
// Told apart from one that is not
const PROBE_GATES = [
  { ascension: 0, constellationCount: 0 },
  { ascension: 6, constellationCount: 6 },
] as const;
const PROBE_LEVEL = 90;

// The stat a kit's function of its striker scales with and the share it gives of it, where the function is that share
// Of that one stat for any striker: none where it reads another stat too, is gated on the striker's ascension or
// Constellations, is not linear in the stat, or fails without a striker in play
export const probeKitScaling = (
  kit: Kit,
  characterId: number,
  getValue: (combatant: Combatant) => number,
): KitScaling | undefined => {
  const readValue = (gateIndex: number, attribute?: Attribute, stat = 0) => {
    const attributeTotalMap = Object.fromEntries(Attributes.map((key) => [key, 0]));
    const attributes = { attack: 0, attributeTotalMap, defense: 0, maxHealth: 0 };
    if (attribute !== undefined) {
      attributeTotalMap[attribute] = stat;
      const field = ScalingAttributeFieldMap[attribute];
      if (field !== undefined) attributes[field] = stat;
    }
    const gate = PROBE_GATES[gateIndex] ?? PROBE_GATES[0];
    return getResult(() =>
      getValue({ ...gate, attributes, characterId, elementalResonances: [], kit, level: PROBE_LEVEL }),
    ).unwrapOr(Number.NaN);
  };
  const scalings = PROBE_GATES.map((_gate, gateIndex) => {
    if (readValue(gateIndex) !== 0) return undefined;
    const shareEntries = SCALING_ATTRIBUTES.flatMap((attribute) => {
      const share = readValue(gateIndex, attribute, 1);
      return share === 0 ? [] : [{ attribute, isLinear: readValue(gateIndex, attribute, 2) === share * 2, share }];
    });
    const [shareEntry] = shareEntries;
    return shareEntries.length === 1 && shareEntry?.isLinear
      ? { attribute: shareEntry.attribute, share: shareEntry.share }
      : undefined;
  });
  const [scaling] = scalings;
  return scaling !== undefined &&
    scalings.every((gateScaling) => gateScaling?.attribute === scaling.attribute && gateScaling.share === scaling.share)
    ? scaling
    : undefined;
};
