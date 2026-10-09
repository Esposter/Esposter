import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import deck1Slice from "#src/generated/gcg/deck1.json";
import deck3Slice from "#src/generated/gcg/deck3.json";
import standardRuleSlice from "#src/generated/gcg/standardRule.json";
import englishGcgText from "#src/generated/gcgText/English.json";
import { Element } from "#src/models/Element";
import { GcgPhase } from "#src/models/gcg/GcgPhase";
import { gcgStandardRuleSchema } from "#src/models/gcg/gcgStandardRuleSchema";
import { createGcgDuel } from "#src/services/gcg/createGcgDuel";
import { parseGcgDeck } from "#src/services/gcg/parseGcgDeck";
import { prepareGcgSide } from "#src/services/gcg/prepareGcgSide";
import { rerollGcgDice } from "#src/services/gcg/rerollGcgDice";
import { takeOne } from "@esposter/shared";
import { createSeededRandom } from "genshin-engine";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The duel board in the English PC client at 1080 high (`tvboQ_ZWO_I` at 407 seconds, a Maguu Kenki tavern challenge in
// The Action Phase, the player's turn). Its decks are the game's own slices, the tutorial deck as the opponent's and deck
// 3 as the player's placeholder, and each character's HP, the dice and the turn are set to the frame's: the frame's
// Characters are not these decks' characters, so only their HP, dice, phase and turn are read off it
const random = createSeededRandom(7);
const rule = gcgStandardRuleSchema.parse(standardRuleSlice);
const duel: GcgDuel = createGcgDuel([parseGcgDeck(deck3Slice), parseGcgDeck(deck1Slice)], random, rule);
for (const sideIndex of [0, 1]) prepareGcgSide(duel, sideIndex, [], 0, random);
for (const sideIndex of [0, 1]) rerollGcgDice(duel, sideIndex, [], random);
duel.phase = GcgPhase.Action;
duel.actingSideIndex = 0;
duel.sides[0].dice = [
  Element.Electro,
  Element.Electro,
  Element.Hydro,
  Element.Geo,
  Element.Geo,
  Element.Cryo,
  Element.Pyro,
  Element.Dendro,
];
for (const character of duel.sides[0].characters) character.hp = 10;
duel.sides[1].activeIndex = 1;
takeOne(duel.sides[1].characters, 0).hp = 6;
takeOne(duel.sides[1].characters, 1).hp = 28;
takeOne(duel.sides[1].characters, 2).hp = 6;

export const props = { duel, gameText: ENGLISH_GAME_TEXT, playerSideIndex: 0, textMap: englishGcgText };
