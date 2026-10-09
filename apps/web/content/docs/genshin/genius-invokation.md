---
title: Genius Invokation TCG
description: The card game's rules engine, its opponents' decks and its duel board: a duel's dice and round, skills and cards paid in dice and energy, the phases' hooks, the reactions and the outcome, played on a screen a resident's talk opens. No duel is seated yet, since no challenger with a built deck stands in a built region's residents, so the board is reviewed through its parity fixture until one does.
---

# Genius Invokation TCG

The card game is a rules engine of its own in `genshin-world`: a duel is a plain state over two sides, advanced by the actions a duel answers, and it shares only the elements with the world. This page is what is built of [Genius Invokation TCG](/docs/proposals/genshin/genius-invokation). Each built deck's characters, their skills and their action cards has a module, and a duel plays them through the engine's public functions. A resident's talk opens the duel board (`GcgScreen`), and a session host plays it: each of the player's choices is an engine action, and the opponent's turns are the scripted policy's, until the board leaves.

## Decisions

- **Duels against residents run the untimed standard rule.** The rule table's second rule is the one with no clocks, since a duel against a resident has no round to run out. Its reactions and hand limit are the matchmaking rule's, which it is listed beside. `genshin:assets gcg` writes its draw, hand limit and reactions as one slice the world imports on demand.
- **The reactions are the table's element pairs, and their effects are the wiki's.** The rule lists its reactions by pair, and the table gives each pair's id. The bonuses, the shields, the spread, the piercing and the forced switch come from the wiki's rules page, since the skill rows that name them carry their values in declared-value sets this build does not read.
- **Elements apply, and Anemo and Geo do not.** Cryo, Hydro, Pyro, Electro and Dendro damage sets its aura. Anemo and Geo damage reacts with an aura and sets none, and Physical and Piercing damage reacts with nothing. A reaction consumes the aura it reacts with, and its element does not apply.
- **The reactions leave their cards on the attacker's side.** Burning summons Burning Flame, which deals one Pyro at each end phase, spends a usage, and stacks to two usages. Bloom leaves Dendro Core onstage, which adds two to the next Pyro or Electro damage its side's skills deal, for one usage. Quicken leaves Catalyzing Field onstage, which adds one to the next Dendro or Electro damage, for two usages. The numbers are the game's own card descriptions, read through the text map, so Dendro Core's bonus is two, where the brief that asked for it said one. A second reaction of the same kind joins the card already there, up to the card's most usages, rather than a second copy.
- **A reaction's bonus joins its instance.** Melt, Vaporize and Overloaded add two. Superconduct, Electro-Charged, Frozen, Crystallize, Burning, Bloom and Quicken add one. Swirl adds none.
- **Frozen and shields.** A Frozen target takes two more from a Pyro or Physical hit, and that hit removes the status, which otherwise lasts to the round's end. A shield takes damage before HP, and piercing skips it. Crystallize grants the attacker's active character one point, at most two.
- **Piercing and spread.** Superconduct and Electro-Charged pierce the other opposing characters for one. A Swirl spreads one of its aura's elements to each of them as damage only: it sets no aura and reacts with none. The wiki does not say whether a spread applies or reacts, so this is a settled call, and a recording of a duel can overturn it ([Recordings owed](/docs/genshin/roadmap)).
- **Overloaded forces the switch.** An Overloaded active character is switched to the next standing character in order, with no choice given.
- **A defeated active is replaced by a free action.** A side owes a replacement while one of its characters stands, and may take it at any point in the action phase. Only that side's turn actions wait on it, and the turn does not.
- **Preparation switches once, then chooses.** A side's switched cards go back into its draw pile, which is shuffled and drawn from to refill its hand. Then it chooses its active character, and the first round's roll starts once both sides have.
- **Rolls and rerolls.** Each side rolls eight dice a round, each face one of the seven elements or Omni, equally likely, from the seeded source. Each side then has one reroll of any dice it names, and naming none passes.
- **Combat actions pass the turn.** Using a skill, switching for one die of any face and declaring the round's end are combat actions, and each passes the turn unless the other side has already declared its end. Tuning is a fast action: it discards a card to set one die to the active character's element, and the turn stays.
- **The round's end.** The side that declares first goes first next round, and the first round goes to the first side. Frozen lapses at the end phase, each side draws the rule's two cards, from the first side on, and a draw past the hand's limit is discarded.
- **Energy.** A normal attack and an elemental skill gain the skill row's energy, one, and a burst pays the energy its cost names. A skill that a character cannot pay for is refused, and the dice it would have paid stay in the dice.
- **A duel concedes after its fifteenth round.** Once that round's end phase closes, both sides concede with no winner, as the wiki gives the limit.
- **The data is the dump's, read by its plain fields.** `genshin:assets gcg` writes the standard rule and one slice per opponent deck (`generated/gcg/deck<id>.json`) from the dump's `GCGDeckExcelConfigData`, `GCGCharExcelConfigData`, `GCGSkillExcelConfigData`, `GCGCardExcelConfigData` and `GCGCostExcelConfigData`. Each row's obfuscated keys are unread; the plain fields carry everything a duel reads, and each cost type must be named by the cost table or the write refuses.
- **The tutorial deck is deck 1.** Its characters are 1301, 1303 and 1203, and its thirty card copies are fifteen distinct action cards. The slice also holds the four cards those characters' skills create, which a duel needs as cards of their own: Pyro Infusion, Inspiration Field, Reflection and Illusory Bubble.
- **Decks 3 and 4 are the smallest legal opponent decks the build chose.** Deck 3 is `GCGDeckExcelConfigData` id 3, with Chongyun (1104), Yoimiya (1305) and Razor (1402) and fifteen distinct cards. Deck 4 is id 4, with Rhodeia of Loch (2201), Maguu Kenki (2501) and Yoimiya, and sixteen distinct cards, two of them talents of Rhodeia and Maguu. Deck 10 is not legal, since its Crossfire needs Xiangling in the deck, and deck 2 needs far more scripts than the two chosen. Yoimiya's cards and skills are shared, and each deck's slice holds its own created cards: deck 3's Chonghua Frost Field (111041), Niwabi Enshou (113051), Aurous Blaze (113052) and The Wolf Within (114021), and deck 4's Shadowsword: Lone Gale (125011), Shadowsword: Galloping Frost (125012) and the Oceanic Mimics Squirrel (122011), Raptor (122012) and Frog (122013).
- **The duel rows name each opponent's deck, and no early opponent plays deck 3 or 4.** A duel's enemy card group is its deck's id. The tutorial quest's two duels, `GCGQuestLevel` quests 7066507 and 7066516, play decks 30111 (Sucrose, Diluc, Kaeya) and 30112 (Fischl, Bennett, Kaeya). The Mondstadt challengers Marjorie and Ellin, who open at Genius Invokation level 0, first duel on decks 11005 (Diona, Jean, Rhodeia of Loch) and 11002, a group of monsters. Deck 1 is the enemy deck of the Diluc duel (game 12) and deck 2 of the Oceanid duel (game 11), the two lowest-numbered duels with talk rows, which no quest or tavern row names. Decks 3 and 4 are the enemy decks of PVP games 4 and 3, which pit the two against each other, and no NPC plays them. So nothing in the tables ties deck 1 to the tutorial quest: "the tutorial deck" is the build's name for it. The early decks' test is `scripts/src/services/genshinAssets/gcg/earlyOpponentDecks.test.ts`.
- **Niwabi Enshou's +1 is taken on the conversion.** Its card reads that its character's Normal Attacks deal one DMG more and convert their Physical DMG to Pyro. The engine's damage carries no skill to test for a Normal Attack, so the card adds one to each Physical damage it converts, which the decks' Normal Attacks are, and spends a usage on each.
- **A skill's damage carries the skill.** A duel's context names the skill whose damage it is, when a skill deals it, so a card can tell a Normal Attack from the rest: Jueyun Guoba's one DMG more is the next Normal Attack only.
- **A card's skill damage is returned, not dealt.** A card's `onSkillUsed` returns the damage it deals, and the skill run deals it. A card that deals damage itself would import the damage pipeline it is part of.
- **A talent card is equipped and its skill used at once.** Naganohara Meteor Swarm, Streaming Surge and Transcendent Automaton each equip to their character while she is active, and the skill the card names is used at once, through one shared helper. Streaming Surge gives each summon of her side a usage when Tide and Torrent is used. Transcendent Automaton switches to the next standing character after Blustering Blade and to the previous one after Frosty Assault, the previous being the standing character before her in order.
- **Katheryne's fast switch is a card's hook.** The switch takes the fast action of a passive or of a support, so a switch consults the field's cards for `isSwitchFast`, and Katheryne takes it once a round.
- **Oceanic Mimics are summoned by the kind fewest on the field.** The game chooses the kind at random, prioritising a kind the side does not hold. A duel's skill has no random source to draw on, so the summon takes the kind with the fewest copies, earliest kind first on a tie. Rhodeia's Myriad Wilds summons two this way.
- **The Frog's one usage is kept until it is spent.** The Frog takes one DMG off each active-character hit, once, and its usage is kept while untouched, so it stays on the field until the end phase deals its two Hydro DMG and takes it off. Its spent state is its counter.
- **Food is one a character a round.** Jueyun Guoba and Northern Smoked Chicken hold a food status for the round, and a character holding one takes no second food. Mondstadt Hash Brown keeps its own once-a-round gate, which is not a status.
- **Two of the supports' values are the dump's descriptions.** Wangshu Inn heals the most injured standby character for two, and Iron Tongue Tian gives one Energy to a standing character without its maximum, active first, both from the card descriptions, at two usages each.
- **A skill is its effect's name.** `Effect_Damage_<Name>_<n>` deals `n` damage of the element the name spells, `Physic` is Physical and `Fire`, `Water`, `Ice`, `Electric`, `Wind`, `Rock` and `Grass` are the seven elements. A character's own script is `Char_Skill_<id>`, and each one is a module under `services/gcg/cards`. A card's own script is named by the card, and its module is keyed by the card's id.
- **The damage numbers of a character's script come from its wiki skill page.** The description's damage is a placeholder the game fills from the skill's configuration, which the dump's tables do not hold. Each module cites the wiki's value for its skill, and no test checks a damage against a description, since the description carries no number to check.
- **A card module's hooks are the card's behaviour, each optional.** Equipment is equipped to a character, a support takes a support zone's place, and an event is gone once played. A zone card's usages and rounds are the module's own, and a card with a limit is taken off the field once it runs out. A skill's damage passes every field card's additive bonus first, then every doubling, so Illusory Bubble doubles after Inspiration Field's bonus.
- **Phases run hooks.** The roll-phase hooks run once a side's dice are rolled, the action-phase hooks when the action phase opens, and the end-phase hooks in the end phase before the draws. An end-phase hook may return damage, which the phase deals, so a summon's end-phase damage is dealt by the phase rather than by the summon.
- **Guaranteed dice are set at the roll.** Crimson Witch of Flames and Jade Chamber set their two starting dice when the dice are rolled, and a reroll may still throw them.
- **Playing a card is a fast action.** A card passes no turn. Flowing Flame's Searing Onslaught is used at once when it is equipped, without its cost.
- **The field holds what the cards say, up to their limits.** A dice cap of sixteen, four supports, and one equipment of each kind a character holds, as the game gives them. Timmie's Pigeon is gained at each end phase, the one round trigger the card's text does not name.
- **Mona's Illusory Torrent is recorded when it applies.** The passive makes the first switch away from Mona in a round a fast action, and the switch records the passive as used for the round.
- **The slice carries the text ids, and the words are the world's.** Each character and action card carries `nameTextId` and `descriptionTextId`, the dump's `nameTextMapHash` and `descTextMapHash` as numbers, and `pnpm -C scripts genshin:text gcg` writes every name and description the slices name into `generated/gcgText/<language>.json`, one chunk a language, which `GcgTextLoaderMap` imports on demand. A description is the card's full text, since the on-table text the dump also gives is missing from the text map for many cards. Two things a screen must handle: a character's description id names no text in any language of the dump, so its entry is empty, and most descriptions keep the game's reference tokens (`$[K…]` for a keyword, a character, a skill or a card, and `{SPRITE_PRESET#…}` for an icon) for the screen to resolve.
- **Game 30111 names the player's deck, deck 7.** Its card group is 7, with Diluc (1301), Kaeya (1103) and Sucrose (1501) and thirty distinct cards. Game 30111's enemy deck is 30111, with Sucrose, Diluc and Kaeya and twenty-eight distinct cards, and game 30112's is 30112, with Fischl (1401), Bennett (1303) and Kaeya, also twenty-eight. Game 30112 names no player deck: its card group is 0, the player's own choice. The slices' created cards are Pyro Infusion (113011), Icicle (111031) and Large Wind Spirit (115011) for decks 7 and 30111, and Inspiration Field (113031), Oz (114011) and Icicle for deck 30112.
- **A switch is paid through the field's reductions.** A switch costs one die of any face, and a card that reduces a switch takes that die off: Dawn Winery, twice a round, and Changing Shifts, once. A switch may therefore pay no die. Leave It to Me! makes the next switch a fast action and is spent by it, and Icicle deals its 2 Cryo DMG after each switch its side makes.
- **The field's choices take the engine's fixed order.** Calx's Arts shifts one energy from each of at most two standing characters on standby, in their order. A weapon or artifact shift moves the first equipment that fits, and Quick Knit and Send Off take the summon their target names by its place on the field. A choice a duel screen can ask the player is left to that screen.
- **Midnight Phantasmagoria's piercing is a skill hook.** Its 2 Piercing DMG to each standby opposing character is the skill's `getStandbyPiercing`, dealt after the damage, so no card module imports the damage pipeline it sits in.
- **I Haven't Lost Yet! reads a defeat this round.** A side records a defeat when one of its characters falls, and the round's end clears the record, so the card plays once a round, and only after a defeat that round.
- **Minty Meat Rolls takes a Void die.** Its next three Normal Attacks cost one Unaligned die less, which its reduction takes from the Void line alone. Sweet Madame and Minty Meat Rolls are food, so their character eats no other food that round, as Jueyun Guoba's status does.
- **Deck 2 is the Oceanid duel's, with Xiangling and Fischl.** Its characters are Rhodeia of Loch (2201), Xiangling (1302) and Fischl (1401), and its thirty copies are sixteen distinct cards. Its created cards are Guoba (113021), Pyronado (113022), Oz (114011) and the Oceanic Mimics (122011 to 122013). Crossfire (213021), Xiangling's talent, adds one Pyro DMG to each Guoba Attack she uses, and Tubby (322006) takes two dice off the next location support a side plays, once a round.
- **Decks 11005 and 11002 are the Mondstadt challengers', and 11002 is monsters.** Deck 11005 is Marjorie's, with Diona (1102), Jean (1502) and Rhodeia of Loch (2201) and twenty-eight distinct cards, and its created cards are Drunken Mist (111023) and Dandelion Field (115021). Deck 11002 is Ellin's, with the Cryo Hilichurl Shooter (3102), the Blazing Axe Mitachurl (3302) and the Electro Slime (3406), and it holds no cards at all: its slice holds only the two statuses its passives give at the battle's start, Flowfire Edge (133021) and Elemental Lifeform: Electro (134061).
- **Cat-Claw Shield is a shield, not a card.** Icy Paws grants its one Shield point to the active character at once and leaves nothing on the field, as the card's text reads.
- **A card a skill creates hears the next skill, not its own.** The on-use hooks run over the cards on the field when the skill is used, so Pyronado does not deal its 2 Pyro DMG on the use that creates it.
- **A passive's hooks run after each skill its character uses.** Hide switches the next standing character in after the skill, through the passive's `afterSkillUsed` hook, which runs after the on-use hooks.
- **Passives give their statuses when the battle begins.** A passive's `getStartingStatus` gives its status when the side is created, so Flowfire Edge converts the character's Physical DMG to Pyro for three usages, and Elemental Lifeform: Electro keeps Electro applied to its character, which a hit re-applies after it reacts, and takes no Electro DMG.
- **The monsters' Electro is `Elec`.** A monster skill's `Effect_Damage_Elec_<n>` names Electro as the game spells it, so the damage names map takes `Elec` beside `Electric`.
- **Dandelion Breeze heals the standing characters only**, since a defeated character takes no heal, as Signature Mix's heal does.
- **Tubby reads a location tag the slice now writes.** Each card's slice entry carries `isLocation`, from the dump's `GCG_TAG_PLACE` tag, so the reduction is the card's own tag rather than a list kept beside it.
- **Large Wind Spirit converts once, on the first Swirl its side makes.** Its damage is Anemo until a Swirl reaction on its side gives it the Swirled element, which its zone card keeps as its `element`, and a second Swirl leaves it as it is, as the card's text allows.

Charged and plunging attacks are markers no tutorial skill uses, so the engine deals them no damage. The decks beyond those this page names are the proposal's, not this page's.

- **A duel is opened by its game id.** A seat names the game of the card game's own table it duels with (`duelGameId`), and `genshin:assets gcg` writes one small map, `generated/gcg/games.json`, of the seated games from the game table: each game's opponent deck, and the player's deck the game names. A game whose opponent deck is not written fails the run, and one whose player deck is not written plays the placeholder deck 3 until it is. No game is seated yet, so the map is empty.
- **No duel is seated yet.** A seat is placed only on a challenger NPC that a built region's residents hold. The game's NPC is read from `GCGWeekLevel`, whose `npcId` names the challenger and whose `levelCondList` names each game's id. Two challengers have built decks: Marjorie, NPC 9701 on games 1021 to 1025 with deck 11005, and Ellin, NPC 9704 on games 1031 to 1035 with deck 11002. Neither has a resident row in `data/regions/*.json`, so `RESIDENT_DUEL_GAME_ID_MAP` is empty. The other built decks belong to player-versus-player games or the tutorial quest's levels, which name no NPC. Duels open from their challengers once their region's residents are written.
- **A talk offers the duel as a reply on its opening line.** The reply is the game's own "I challenge you to a duel!" (text id `191219274`), offered after the talk's own replies. Choosing it leaves the talk for the board, and the board's leave returns to the world.
- **A resident's standing talk is one more talk source.** A resident whose duel names a game holds its standing talk whatever the quests hold: `getStandingTalks` gives the talks the residents hold, by talk id, and `mergeTalks` merges the talk sources in order, so a quest's talk of an id wins over a standing talk of the same id. The world's screen still reads only the quests' talks, and reads the merged list when the talks system is split out, which the [proposal](/docs/proposals/genshin/genius-invokation) records.
- **The board holds only what the player is choosing.** `GcgScreen` keeps the dice picked, the card armed, the tuning and the switch and prepare choices, and every other choice leaves as an event. The session host plays each event through the engine and then runs the opponent through `advanceGcgOpponent`; a refused action leaves the duel as it was, and the board clears its choice either way.
- **The scripted policy is the world's service.** The greedy policy (`takeGcgScriptedAction`) and `advanceGcgOpponent` left the tutorial duel's test, so the board and the tests drive one opponent.
- **The reference is a public frame.** The board is judged against a frame at 407 seconds of the English PC client's tavern duel, cut from its 400-second segment (`gcg-yt-tvboQ_ZWO_I-400-410.mp4`). The board draws that frame's HP, dice, phase and turn, but not its characters, art or ornaments, which are the game's and are never drawn here. Its compare score is the snapshot's row.

## How it works

```mermaid
stateDiagram-v2
  [*] --> Preparation: both sides draw their hands
  Preparation --> Roll: each switches once and chooses its active
  Roll --> Action: each rerolls once, the first side acts
  Action --> Action: a combat action passes the turn, a tuning keeps it
  Action --> Action: a side's defeated active is replaced for free
  Action --> Roll: both sides declare the round's end, and the end phase draws
  Roll --> [*]: the fifteenth round's end concedes
  Action --> [*]: one side has no character standing
```

The end phase is not a phase of its own: it runs as the round closes, and the next round's roll follows it. Each action is a function of its own, and a refused one leaves the duel as it was and says why.

A hit on the opposing active character is settled in one order:

```mermaid
flowchart TD
  HIT["A damage to the opposing active"] --> KIND{"Piercing, Physical or an element?"}
  KIND -->|"Piercing"| PIERCE["Taken past any shield"]
  KIND -->|"Physical"| FROZEN["Frozen adds two, and lapses"]
  KIND -->|"an element"| AURA{"Does the aura make a listed reaction?"}
  AURA -->|"no"| APPLY["An applying element sets the aura"]
  AURA -->|"yes"| REACT["The aura is consumed, the reaction's bonus joins the hit, and its effects follow"]
  PIERCE --> DEFEAT["A character at no HP is cleared, and its side owes a replacement or loses"]
  FROZEN --> DEFEAT
  APPLY --> DEFEAT
  REACT --> DEFEAT
```

## The decks

```mermaid
flowchart LR
  CARD["A card in hand is played"] --> FIT{"Its kind takes the card?"}
  FIT -->|"equipment"| EQUIP["Equipped to the target"]
  FIT -->|"support"| SUPPORT["In the support zone"]
  FIT -->|"event"| GONE["Played and gone"]
  EQUIP --> PAY["Costs paid, reduced by the field first"]
  SUPPORT --> PAY
  GONE --> PAY
  PAY --> RUN["The card's module plays: its effect, then any skill it has used at once"]
```

A skill follows the same path with its own costs, then its effect: a shared damage, dealt with the field's bonuses, then the character's script's own after-effects, such as Dawn's Pyro Infusion or Fantastic Voyage's Inspiration Field.

## The duel from a talk

```mermaid
flowchart LR
  TALK["A resident's talk, begun from the world"] --> OFFER{"Its resident has a game?"}
  OFFER -->|"no"| TALK
  OFFER -->|"yes, its duel reply is chosen"| SESSION["The session loads the game's decks and its words"]
  SESSION --> BOARD["The board: the player's choices"]
  BOARD --> ENGINE["The engine plays the choice, then the opponent's turns"]
  ENGINE --> BOARD
  ENGINE -->|"the duel ends"| WORLD["The board's leave returns to the world"]
```

## Key files

| File                                                                           | Role                                                                                                     |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/gcg/writeGcgStandardRule.ts`               | Writes the standard rule's slice from the dump's rule and reaction tables                                |
| `scripts/src/services/genshinAssets/gcg/toGcgStandardRule.ts`                  | The rule row, with each listed reaction joined to its element pair                                       |
| `packages/genshin-world/src/generated/gcg/standardRule.json`                   | The written slice, imported on demand                                                                    |
| `packages/genshin-world/src/services/gcg/readGcgStandardRule.ts`               | Imports the slice and checks it against its schema                                                       |
| `packages/genshin-world/src/services/gcg/createGcgDuel.ts`                     | Opens a duel between two decks                                                                           |
| `packages/genshin-world/src/services/gcg/prepareGcgSide.ts`                    | A side's preparation, and the first roll once both have prepared                                         |
| `packages/genshin-world/src/services/gcg/rerollGcgDice.ts`                     | A side's one reroll, and the action phase once both have rolled                                          |
| `packages/genshin-world/src/services/gcg/useGcgSkill.ts`                       | A skill paid in dice and energy, then the turn passes                                                    |
| `scripts/src/services/genshinAssets/gcg/writeGcgDeck.ts`                       | Writes one deck's slice from the dump's deck, character, skill, card and cost tables                     |
| `scripts/src/services/genshinAssets/gcg/toGcgDeck.ts`                          | The slice's rows: costs, kinds and text ids from the dump's plain fields                                 |
| `packages/genshin-world/src/generated/gcg/deck<id>.json`                       | The written slice of each opponent deck, imported on demand                                              |
| `packages/genshin-world/src/services/gcg/GcgDeckLoaderMap.ts`                  | Each opponent deck's slice by its deck id, imported on demand                                            |
| `packages/genshin-world/src/services/gcg/readGcgDeck.ts`                       | Reads a deck's slice by its id and checks it against its schema                                          |
| `packages/genshin-world/src/services/gcg/effects/createGcgTalentCard.ts`       | A talent card equipped to its character while she is active, with its skill used at once                 |
| `packages/genshin-world/src/services/gcg/effects/createGcgWeaponCard.ts`       | A weapon card that only its kind of character may equip, and that adds one DMG                           |
| `packages/genshin-world/src/services/gcg/effects/summonGcgOceanicMimics.ts`    | The Oceanic Mimics summoned by the kind fewest on the field                                              |
| `packages/genshin-world/src/services/gcg/effects/canEatGcgFood.ts`             | Whether a character may eat a food, one a round                                                          |
| `packages/genshin-world/src/services/gcg/findGcgAdjacentCharacterIndex.ts`     | The standing character one step away, forward or back, round the side                                    |
| `packages/genshin-world/src/services/gcg/playGcgCard.ts`                       | A card played from a hand: placed by its kind, paid, then its module plays                               |
| `packages/genshin-world/src/services/gcg/runGcgSkillUse.ts`                    | A skill's effect run for its active character, then its field's on-use hooks and its passives' hooks     |
| `packages/genshin-world/src/services/gcg/dealGcgSkillDamage.ts`                | A skill's damage with the field's bonuses and doublings, then dealt                                      |
| `packages/genshin-world/src/services/gcg/payGcgSubjectCost.ts`                 | A skill's or card's costs, reduced by the field, paid from the dice chosen                               |
| `packages/genshin-world/src/services/gcg/runGcgRollPhase.ts`                   | The roll-phase hooks of each side's field                                                                |
| `packages/genshin-world/src/services/gcg/runGcgActionPhase.ts`                 | The action-phase hooks, then the spent cards taken off                                                   |
| `packages/genshin-world/src/services/gcg/runGcgEndPhase.ts`                    | The end-phase hooks, the rounds aged, then the spent cards taken off                                     |
| `packages/genshin-world/src/services/gcg/cards/gcgCardIdModuleMap.ts`          | Every card's module by its id                                                                            |
| `packages/genshin-world/src/services/gcg/cards/gcgEffectNameSkillModuleMap.ts` | Every character's script by its effect name                                                              |
| `packages/genshin-world/src/services/gcg/cards/`                               | One module per card and per character script, each from its text and its wiki page                       |
| `packages/genshin-world/src/services/gcg/applyGcgDamage.ts`                    | A hit's Frozen, reaction, shield and piercing, and its defeats                                           |
| `packages/genshin-world/src/services/gcg/declareGcgRoundEnd.ts`                | The round's end, and the end phase once both sides declare                                               |
| `packages/genshin-world/src/services/gcg/endGcgRound.ts`                       | The end phase: Frozen lapses, the draws, and the next round or the concession                            |
| `packages/genshin-world/src/services/gcg/switchGcgCharacter.ts`                | A switch for one die of any face, less where the field reduces it                                        |
| `packages/genshin-world/src/services/gcg/tuneGcgDie.ts`                        | Tuning a die by a discarded card, as a fast action                                                       |
| `packages/genshin-world/src/services/gcg/replaceGcgCharacter.ts`               | The free replacement a defeated active owes                                                              |
| `packages/genshin-world/src/services/gcg/payGcgCost.ts`                        | The dice a cost takes from the dice chosen, Omni standing in                                             |
| `packages/genshin-world/src/services/gcg/getGcgReactionKind.ts`                | The reaction an element pair makes under a rule                                                          |
| `packages/genshin-world/src/components/Gcg/Screen/Index.vue`                   | The duel board: the events it emits and the props it takes, the duel as the engine holds it              |
| `packages/genshin-world/src/components/Gcg/Session/Index.vue`                  | The duel's host: loads its game's decks and words, plays each player event, then the opponent            |
| `packages/genshin-world/src/components/Gcg/Screen/Index.fixture.ts`            | The board in the frame's state: its HP, dice and turn, with the tutorial and placeholder decks           |
| `packages/genshin-world/src/components/Gcg/Screen/Index.reference.ts`          | The public frame the board is judged against, and what was found reading it                              |
| `packages/genshin-world/src/services/gcg/advanceGcgOpponent.ts`                | Runs a side through its preparation, reroll, replacement or turn, until the duel waits on the other side |
| `packages/genshin-world/src/services/gcg/takeGcgScriptedAction.ts`             | The greedy policy a side takes its turn by: the first card, then the first skill, then the round's end   |
| `packages/genshin-world/src/services/gcg/readGcgGame.ts`                       | A duel's game from the games map, by its game id in the game table                                       |
| `packages/genshin-world/src/generated/gcg/games.json`                          | The games the world's residents duel with, each with its opponent's deck and the player's                |
| `scripts/src/services/genshinAssets/gcg/writeGcgGames.ts`                      | Writes the games map from the dump's game table                                                          |
| `scripts/src/services/genshinAssets/gcg/toGcgGames.ts`                         | Each game as a duel plays it, the placeholder deck where the game names an unbuilt one                   |
| `packages/genshin-world/src/models/world/Resident.ts`                          | A resident's optional duel, by the game it duels with                                                    |
| `packages/genshin-world/src/services/dialogue/constants.ts`                    | The reply a talk offers a duel with                                                                      |
| `packages/genshin-world/src/services/dialogue/mergeTalks.ts`                   | The talk sources merged by id, a shared id held by the earlier source                                    |
| `packages/genshin-world/src/services/resident/getStandingTalks.ts`             | The standing talks the residents hold, by talk id, where their duel names a game                         |
| `scripts/src/services/genshinText/writeGcgText.ts`                             | The names and descriptions the slices name, one chunk of the world's per language                        |
| `packages/genshin-world/src/services/gcg/GcgTextLoaderMap.ts`                  | Each language's card game chunk by text id, imported on demand                                           |
| `packages/genshin-world/src/generated/gcgText/`                                | The card game's names and descriptions, one chunk a language                                             |

## Sources

- [Genius Invokation TCG: Rules](https://genshin-impact.fandom.com/wiki/Genius_Invokation_TCG/Rules), Genshin Impact Wiki: the preparation, the round's phases, the zones, the elemental reactions and their bonuses, the piercing and the spread, and the fifteen-round limit.
- The Genshin Impact Wiki's character card skill, card and summon pages for decks 3 and 4, such as [Oceanid Mimic Summoning (Character Card Skill)](<https://genshin-impact.fandom.com/wiki/Oceanid_Mimic_Summoning_(Character_Card_Skill)>), [Tide and Torrent (Character Card Skill)](<https://genshin-impact.fandom.com/wiki/Tide_and_Torrent_(Character_Card_Skill)>) and [Lightning Fang (Character Card Skill)](<https://genshin-impact.fandom.com/wiki/Lightning_Fang_(Character_Card_Skill)>), for each script's damage and summons, and each card's text.
- [AnimeGameData](https://gitlab.com/Dimbreath/AnimeGameData), the community's per-patch dump: the rule and element reaction tables the standard rule is written from, and the deck, character, skill, card and cost tables the tutorial deck is written from.
- The Genshin Impact Wiki's character card skill pages, such as [Dawn (Character Card Skill)](<https://genshin-impact.fandom.com/wiki/Dawn_(Character_Card_Skill)>), for each character script's damage and its after-effect.
