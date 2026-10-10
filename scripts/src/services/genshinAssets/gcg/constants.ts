import { RESIDENT_DUEL_GAME_ID_MAP } from "#src/services/genshinAssets/residents/constants";
import { Element } from "genshin-world";

// The rule the duels against the game's own residents run. Its clocks are all zero, since a duel against a resident
// Has no round to run out; its reactions and hand limit are the matchmaking rule's
export const GCG_STANDARD_RULE_ID = 2;
// The duels the world's residents play, by their game id in the game table: the games their seats name. Their decks are
// Published beside the standard rule
export const GCG_DUEL_GAME_IDS: number[] = [...RESIDENT_DUEL_GAME_ID_MAP.values()];
// The deck the player plays when the game names one no slice is published for: deck 3 stands in until the game's own deck is
// Built, a provisional call recorded on the as-built page
export const GCG_PLACEHOLDER_PLAYER_DECK_ID = 3;
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
  [2, [113_021, 113_022, 114_011, 122_011, 122_012, 122_013]],
  [3, [111_041, 113_051, 113_052, 114_021]],
  [4, [125_011, 125_012, 122_011, 122_012, 122_013]],
  [7, [113_011, 111_031, 115_011]],
  [11_002, [133_021, 134_061]],
  [11_005, [111_023, 115_021]],
  [30_111, [113_011, 111_031, 115_011]],
  [30_112, [113_031, 114_011, 111_031]],
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
