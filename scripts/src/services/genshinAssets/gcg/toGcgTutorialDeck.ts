import type { ExcelGcgCardRow } from "#src/models/genshinAssets/gcg/ExcelGcgCardRow";
import type { ExcelGcgCharRow } from "#src/models/genshinAssets/gcg/ExcelGcgCharRow";
import type { ExcelGcgCostRow } from "#src/models/genshinAssets/gcg/ExcelGcgCostRow";
import type { ExcelGcgDeckRow } from "#src/models/genshinAssets/gcg/ExcelGcgDeckRow";
import type { ExcelGcgSkillRow } from "#src/models/genshinAssets/gcg/ExcelGcgSkillRow";
import type {
  GcgTutorialCard,
  GcgTutorialCharacter,
  GcgTutorialDeck,
  GcgTutorialSkill,
} from "#src/models/genshinAssets/gcg/GcgTutorialDeck";

import { GcgCostTableElementMap } from "#src/services/genshinAssets/gcg/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import type { Element, GcgCost } from "genshin-world";

import { GcgCardKind, GcgCostKind, GcgSkillKind } from "genshin-world";

// The tutorial deck's slice, read from the dump's deck, character, skill and card rows. Its cards are the deck's distinct
// Cards and the cards the tutorial characters create, each with the effect names its skills carry
export const toGcgTutorialDeck = (
  deckRow: ExcelGcgDeckRow,
  characterRows: ExcelGcgCharRow[],
  skillRows: ExcelGcgSkillRow[],
  cardRows: ExcelGcgCardRow[],
  createdCardIds: number[],
  costRows: ExcelGcgCostRow[],
): GcgTutorialDeck => {
  const costTypes = new Set(costRows.map(({ type }) => type));
  const characters = deckRow.characterList.map((characterId) => {
    const characterRow = findRow(characterRows, characterId, "character");
    return toCharacter(characterRow, skillRows, costTypes);
  });
  const cardIds = [...new Set([...deckRow.cardList, ...createdCardIds])];
  return {
    cardIds: deckRow.cardList,
    cards: cardIds.map((cardId) => toCard(findRow(cardRows, cardId, "card"), skillRows, costTypes)),
    characterIds: deckRow.characterList,
    characters,
  };
};

const toCharacter = (
  characterRow: ExcelGcgCharRow,
  skillRows: ExcelGcgSkillRow[],
  costTypes: Set<string>,
): GcgTutorialCharacter => {
  const elementTag = characterRow.tagList.find((tag) => tag.startsWith("GCG_TAG_ELEMENT_"));
  const element = elementTag ? toElement(`GCG_COST_DICE_${elementTag.slice("GCG_TAG_ELEMENT_".length)}`) : undefined;
  if (!element) throw invalidRead(`character ${characterRow.id} names no element`);
  const weaponTag = characterRow.tagList.find((tag) => tag.startsWith("GCG_TAG_WEAPON_"));
  return {
    element,
    hp: characterRow.hp,
    id: characterRow.id,
    maxEnergy: characterRow.maxEnergy,
    skills: characterRow.skillList.map((skillId) => toSkill(findRow(skillRows, skillId, "skill"), costTypes)),
    weapon: weaponTag ? weaponTag.slice("GCG_TAG_WEAPON_".length) : "",
  };
};

const toSkill = (skillRow: ExcelGcgSkillRow, costTypes: Set<string>): GcgTutorialSkill => {
  const kind = toSkillKind(skillRow.skillTagList);
  return {
    costs: toCosts(skillRow.costList, skillRow.id, costTypes),
    effect: skillRow.skillJson,
    energyGain: skillRow.energyRecharge,
    id: skillRow.id,
    kind,
  };
};

const toCard = (cardRow: ExcelGcgCardRow, skillRows: ExcelGcgSkillRow[], costTypes: Set<string>): GcgTutorialCard => ({
  costs: toCosts(cardRow.costList, cardRow.id, costTypes),
  effects: cardRow.skillList.map((skillId) => findRow(skillRows, skillId, "skill").skillJson),
  id: cardRow.id,
  kind: toCardKind(cardRow),
});

// The dump's cost lines: an element's die, Matching dice (the character's own element), Unaligned dice of any face, or
// Energy. The dump's empty rows are left out
const toCosts = (costRows: ExcelGcgSkillRow["costList"], rowId: number, costTypes: Set<string>): GcgCost[] =>
  costRows
    .filter(({ costType }) => costType !== "GCG_COST_INVALID")
    .map(({ costType, count }): GcgCost => {
      if (!costTypes.has(costType)) throw invalidRead(`the cost table names no cost type ${costType} of row ${rowId}`);
      if (costType === "GCG_COST_DICE_SAME") return { count, kind: GcgCostKind.Matching };
      else if (costType === "GCG_COST_DICE_VOID") return { count, kind: GcgCostKind.Unaligned };
      else if (costType === "GCG_COST_ENERGY") return { count, kind: GcgCostKind.Energy };
      return { count, element: toElement(costType, rowId), kind: GcgCostKind.Dice };
    });

// The element a cost type or a character tag names, the tag spelt as its cost type
const toElement = (costType: string, rowId?: number): Element => {
  const element = GcgCostTableElementMap.get(costType);
  if (!element) throw invalidRead(`row ${rowId ?? costType} names no element for ${costType}`);
  return element;
};

// The skill tag the card gives a skill: A for a normal attack, E for an elemental skill, Q for a burst, and PASSIVE for a
// Passive the character holds
const toSkillKind = (skillTags: string[]): GcgSkillKind => {
  if (skillTags.includes("GCG_SKILL_TAG_A")) return GcgSkillKind.NormalAttack;
  else if (skillTags.includes("GCG_SKILL_TAG_E")) return GcgSkillKind.ElementalSkill;
  else if (skillTags.includes("GCG_SKILL_TAG_Q")) return GcgSkillKind.ElementalBurst;
  else if (skillTags.includes("GCG_SKILL_TAG_PASSIVE")) return GcgSkillKind.Passive;
  throw invalidRead(`a skill names no kind in ${skillTags.join(", ")}`);
};

const CardTypeKindMap = new Map<string, GcgCardKind>([
  ["GCG_CARD_ASSIST", GcgCardKind.Support],
  ["GCG_CARD_EVENT", GcgCardKind.Event],
  ["GCG_CARD_ONSTAGE", GcgCardKind.Onstage],
  ["GCG_CARD_STATE", GcgCardKind.State],
  ["GCG_CARD_SUMMON", GcgCardKind.Summon],
]);

// The card type the dump names, which a modify card's tags refine into the kind of equipment it is
const toCardKind = ({ cardType, tagList, id }: ExcelGcgCardRow): GcgCardKind => {
  const equipmentKind =
    cardType === "GCG_CARD_MODIFY" ? EquipmentTagKindMap.find(([tag]) => tagList.includes(tag))?.[1] : undefined;
  const kind = equipmentKind ?? CardTypeKindMap.get(cardType);
  if (kind === undefined) throw invalidRead(`card ${id} has the unknown type ${cardType}`);
  return kind;
};

const EquipmentTagKindMap: [string, GcgCardKind][] = [
  ["GCG_TAG_TALENT", GcgCardKind.Talent],
  ["GCG_TAG_WEAPON", GcgCardKind.Weapon],
  ["GCG_TAG_ARTIFACT", GcgCardKind.Artifact],
];

const findRow = <TRow extends { id: number }>(rows: TRow[], id: number, name: string): TRow => {
  const row = rows.find((candidate) => candidate.id === id);
  if (!row) throw invalidRead(`the ${name} table holds no ${name} ${id}`);
  return row;
};

const invalidRead = (message: string) => new InvalidOperationError(Operation.Read, "tutorial deck", message);
