import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { Element } from "genshin-world";
import { join } from "node:path";

// The rule the duels against the game's own residents run. Its clocks are all zero, since a duel against a resident
// Has no round to run out; its reactions and hand limit are the matchmaking rule's
export const GCG_STANDARD_RULE_ID = 2;
// Where the standard rule's slice is written, the world package's generated folder it is imported on demand from
export const GCG_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "gcg",
);
export const GCG_STANDARD_RULE_PATH: string = join(GCG_GENERATED_DIRECTORY, "standardRule.json");
// The card game's table names each element by its own name in capitals, which the world's Element enum spells otherwise
export const GcgElementTableNameMap: Map<string, Element> = new Map<string, Element>([
  ["GCG_ELEMENT_ANEMO", Element.Anemo],
  ["GCG_ELEMENT_CRYO", Element.Cryo],
  ["GCG_ELEMENT_DENDRO", Element.Dendro],
  ["GCG_ELEMENT_ELECTRO", Element.Electro],
  ["GCG_ELEMENT_GEO", Element.Geo],
  ["GCG_ELEMENT_HYDRO", Element.Hydro],
  ["GCG_ELEMENT_PYRO", Element.Pyro],
]);
// The decks the duels run as opponents, each with the cards its skills create on the field, which a duel needs as cards of
// Their own: the tutorial deck's Pyro Infusion, Inspiration Field, Reflection and Illusory Bubble; deck 3's Chonghua Frost
// Field, Niwabi Enshou, Aurous Blaze and The Wolf Within; and deck 4's two Shadowsword summons and three Oceanic Mimics
export const GcgDeckIdCreatedCardIdsMap: Map<number, number[]> = new Map<number, number[]>([
  [1, [113_011, 113_031, 112_031, 112_032]],
  [3, [111_041, 113_051, 113_052, 114_021]],
  [4, [125_011, 125_012, 122_011, 122_012, 122_013]],
]);
// The cost types the dump names, each mapped to the duel's cost: a die of an element, a Matching die of the character's
// Element, an Unaligned die of any face, or energy. Invalid costs are the dump's empty rows and are left out
export const GcgCostTableElementMap: Map<string, Element> = new Map<string, Element>([
  ["GCG_COST_DICE_ANEMO", Element.Anemo],
  ["GCG_COST_DICE_CRYO", Element.Cryo],
  ["GCG_COST_DICE_DENDRO", Element.Dendro],
  ["GCG_COST_DICE_ELECTRO", Element.Electro],
  ["GCG_COST_DICE_GEO", Element.Geo],
  ["GCG_COST_DICE_HYDRO", Element.Hydro],
  ["GCG_COST_DICE_PYRO", Element.Pyro],
]);
