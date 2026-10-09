---
title: Party
description: The player's party as the game keeps it — up to four characters in each team Party Setup holds, one team deployed and one of its members on the field. A member's key switches it in past the one second cooldown, never one who is down, and Left Alt with the key also uses that member's burst. A team is added, renamed, disbanded or deployed under the game's own limits and refusals, and the deployed team's elements give its Elemental Resonances. The state is plain data and pure rules in genshin-world, read by the world screen once a frame.
---

# Party

In the game, a party is a team of up to four characters, and the player keeps several: Party Setup, on `L`, holds the teams set up, one of them deployed, and one member of the deployed team is on the field. The keys `1` to `4`, and a pad's directions, switch the member on the field. `genshin-world` keeps this as a `Party`, plain data with a few rules over it, so it runs the same in a test as in the world.

## How it works

```mermaid
flowchart TD
  KEY["1 to 4, or a pad's direction, pressed in play"] --> SLOT{"A member in that slot of the deployed team?"}
  SLOT -->|"no, or it is the one on the field"| NOTHING["Unchanged"]
  SLOT -->|yes| DOWN{"Is the character down?"}
  DOWN -->|yes| REFUSE_DOWN["Down: Character is down"]
  DOWN -->|no| COOLDOWN{"A second since the last switch?"}
  COOLDOWN -->|no| REFUSE_COOLDOWN["Cooldown"]
  COOLDOWN -->|yes| SWITCHED["Switched: the member takes the field, the clock's seconds kept"]
```

- **A party is its teams, the one deployed and the one on the field.** `Party` holds every `PartyTeam` set up, the index of the deployed one, the index of its member on the field, each character's own `PartyMember` by its id and the seconds on the world's clock at the last switch. `createParty` starts one as the game starts a player's: the four default teams, Party 1 to 4, the first deployed with the characters given at full HP and its first member on the field.
- **A character keeps its own HP, energy and cooldowns, whichever team holds it.** A `PartyMember` holds its HP as a share of its Max HP, so the HP keeps its share as the Max HP changes, as the game keeps it; its energy toward its burst; and the seconds left on its skill and its burst. A character is down when its HP is gone (`checkIsCharacterDown`), and a character a team takes on joins the party at full HP.
- **A fall brings on the next member.** `damagePartyMember` takes a share of a character's Max HP. One whose HP runs out is down and loses its energy, and if it was on the field the next member of the deployed team standing after it takes the field. `checkIsPartyDown` holds once the whole deployed team is down, and `reviveParty` brings each fallen member back at 35% of its Max HP, as the game revives a fallen team at the nearest waypoint. `drownParty` is the game's drowning: every member loses its energy and 10% of its Max HP.
- **A team is filled from the left.** A `PartyTeam` holds its members' character ids in slot order and the name the player gave it, `""` while it keeps the game's own.
- **A switch is a key's slot, in the order of the deployed team.** `PARTY_MEMBER_INPUT_ACTIONS` holds the actions for slots 1 to 4 ([controls](/docs/genshin/controls) binds them to `1` to `4` and a pad's up, right, left and down). `switchPartyMember` answers with a `PartySwitchResult`: `Unchanged` for an empty slot or the member already on the field, `Down` for a character who is down, `Cooldown` within `PARTY_SWITCH_COOLDOWN_SECONDS` of the last switch, and `Switched` otherwise.
- **Party Setup's edits are refused as the game refuses them.** `deployPartyTeam` deploys a team with its first member standing on the field, and answers `Empty` for a team with nobody in it and `Down` for one whose members are all down. `setPartyTeamCharacters` sets a team's members, each once and four at most; on the deployed team the field keeps its slot, or the last one past a shortened team, so it answers `Empty` for a team emptied and `Down` for a character who is down landing on the field. Both are a `PartyTeamResult`.
- **The character on the field** is `getActiveCharacterId`, the deployed team's member at the active index.
- **Teams are added, renamed and disbanded under the game's limits.** `addPartyTeam` adds an empty team named "Team Standing By" until renamed, and answers `Full` past fifteen teams. `disbandPartyTeam` keeps the four default teams and the deployed one (`Kept`), and a team disbanded before the deployed one moves its index down so the same team stays deployed. `renamePartyTeam` with an empty name gives a team its own name back.
- **A burst on a switch.** [Controls](/docs/genshin/controls) binds `Left Alt` with `1` to `4` to `SwitchToPartyMemberAndBurst1` to `4`, a chord that takes the press over from the plain key. The character's fixed step reads that press (`PARTY_MEMBER_BURST_INPUT_ACTIONS`) and uses its burst once the member is on the field, switched to by the world screen's key that frame or already there, so a refused switch (a cooldown, a fallen member, an empty slot) uses no burst.
- **Elemental Resonance is a rule over the deployed team's elements, and its effects hold on the team while it has them.** `getElementalResonances` gives each element that two or more of a full team's four members share, in the game's element order, the Protective Canopy for four unique elements, and none for a team not full. The resonances that change a stat are summed into every member's attributes by `computeCharacterAttributes`, from `ElementalResonanceAttributeLinesMap`: Pyro's ATK +25%, Hydro's Max HP +25%, Geo's Shield Strength +15%, Dendro's Elemental Mastery +50, and the Protective Canopy's All Elemental RES and Physical RES +15%. Cryo's CRIT Rate +15% against a Frozen or Cryo-affected enemy is read where a hit is struck, in [combat](/docs/genshin/combat). Enduring Rock, Sprawling Greenery and Impetuous Winds act on a strike, a reaction and a skill, as the next section sets out. Each figure is the Elemental Resonance page's in the Genshin Impact Wiki, and the effects whose mechanism is not built yet are on the [party proposal](/docs/proposals/genshin/party).

## Resonances in a strike

Enduring Rock, Sprawling Greenery and Impetuous Winds read the team's shields, the reactions a strike triggers and the skill on the field as they go, so they are applied in the character's step and the strikes it lands rather than summed into the attributes.

```mermaid
flowchart TD
  PRICE["The strike is priced: Enduring Rock's DMG +15% while a shield holds a Geo team"] --> ENEMY["For each enemy in the hit's area"]
  ENEMY --> ROCK{"Geo's resonance and a live shield?"}
  ROCK -->|yes| RES["The enemy's Geo RES -20% for 15s, before the hit reads it"]
  ROCK -->|no| STRIKE
  RES --> STRIKE["strikeEnemy: the energy it dropped and the reactions it triggered"]
  STRIKE --> DENDRO{"Dendro's resonance and a reaction Sprawling Greenery lists?"}
  DENDRO -->|yes| EM["Each party member gains 30 or 20 Elemental Mastery for 6s"]
```

- **Enduring Rock holds while a shield is up.** A live shield on the team, whoever cast it, makes a Geo team's hits deal 15% more: every element's DMG Bonus and the Physical DMG Bonus each rise by it, in the pricing `getBuffedCombatant` gives each strike. Each enemy such a hit strikes loses 20% of its Geo RES for 15 seconds, given before the hit's damage is read (`addEnduringRockStatus`), and `strikeEnemy` reads that RES through the status's `resistanceReduction`. The wiki's Moondrift clause, from Lunar-Crystallize, is not built.
- **Sprawling Greenery follows each reaction a strike triggers.** With Dendro's resonance, a reaction gives every party member Elemental Mastery for 6 seconds: 30 after Burning, Quicken or Bloom, and 20 after Aggravate, Spread, Hyperbloom or Burgeon (`ReactionElementalMasteryMap`). `strikeEnemy` returns the reactions a strike triggered beside the energy it dropped, and `addSprawlingGreeneryBuffs` adds one buff per member for each. A buff restarts only one of its own amount, and the 30 and the 20 run side by side, since the wiki counts their durations on their own.
- **Impetuous Winds shortens a skill, speeds the body and cuts its stamina.** A skill's cooldown is multiplied by 0.95 as it starts, after the kit's own multiplier (`startNextKitAction`). The character on the field walks, runs, sprints and dashes 10% faster: the character step hands the controller `getImpetuousWindsLocomotion`'s speeds, read from the resonances before the controller steps. Every stamina spend, the kit's and the body's, is multiplied by 0.85 while the character on the field carries Anemo's resonance: the character component passes the controller a `getStaminaConsumptionMultiplier` read at each spend, and a charged attack is gated at that same cost.

## The world screen

The world screen keeps the player's characters and their party. A new player's is the Traveler alone, made by `createCharacter` once the roster arrives, at level 1 with the weapon the game gives them ([character attributes](/docs/genshin/character-attributes)). Once a frame, in play with no screen over the world, the first party key pressed is passed to `switchPartyMember` at the canvas clock's elapsed seconds, so a screen over the world holds the keys as it holds the rest of play.

The character on the field fights through its kit, which prices every character's hits from its attributes with the Traveler's kit until the kits run gives each its own ([combat](/docs/genshin/combat)). An enemy's strike, past the team's shields, and a drowning take HP from the party, and a team that has all fallen revives at 35% and is jumped to the Statue of The Seven nearest the body, or left where it fell when none is loaded.

## Key files

| File                                                                               | Role                                                                                                             |
| :--------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/models/party/Party.ts`                                 | The teams, the one deployed, the field, each member, the clock                                                   |
| `packages/genshin-world/src/services/party/createParty.ts`                         | A party as the game starts one                                                                                   |
| `packages/genshin-world/src/services/party/switchPartyMember.ts`                   | A key's switch, or the game's reason for refusing it                                                             |
| `packages/genshin-world/src/services/party/deployPartyTeam.ts`                     | A team deployed, its first member standing on the field                                                          |
| `packages/genshin-world/src/services/party/setPartyTeamCharacters.ts`              | A team's members set, the field keeping its slot                                                                 |
| `packages/genshin-world/src/services/party/damagePartyMember.ts`                   | HP taken, a fall, and the next member brought on                                                                 |
| `packages/genshin-world/src/services/party/gainPartyEnergy.ts`                     | A particle's energy to each standing member of the deployed team                                                 |
| `packages/genshin-world/src/services/party/stepPartyCooldowns.ts`                  | Each member's skill and burst cooldowns, lowered each step                                                       |
| `packages/genshin-world/src/services/party/addPartyTeam.ts`                        | A team added to Party Setup, named until renamed, at most fifteen                                                |
| `packages/genshin-world/src/services/party/disbandPartyTeam.ts`                    | A team disbanded, the defaults and the deployed one kept                                                         |
| `packages/genshin-world/src/services/party/renamePartyTeam.ts`                     | A team renamed, an empty name giving its own back                                                                |
| `packages/genshin-world/src/services/party/getElementalResonances.ts`              | The resonances a full team's elements give                                                                       |
| `packages/genshin-world/src/services/party/ElementalResonanceAttributeLinesMap.ts` | The attribute lines each resonance adds to every member of the deployed team                                     |
| `packages/genshin-world/src/services/party/checkIsEnduringRock.ts`                 | Enduring Rock holds: the deployed team's Geo resonance and a live shield                                         |
| `packages/genshin-world/src/services/party/addEnduringRockStatus.ts`               | The Geo RES an enemy struck under Enduring Rock loses, given before its damage is read                           |
| `packages/genshin-world/src/services/party/ReactionElementalMasteryMap.ts`         | The Elemental Mastery each reaction gives every party member under Sprawling Greenery                            |
| `packages/genshin-world/src/services/party/addSprawlingGreeneryBuffs.ts`           | Each reaction's timed Elemental Mastery, one buff per party member for each reaction                             |
| `packages/genshin-world/src/services/party/getImpetuousWindsLocomotion.ts`         | The walking, running, sprinting and dashing speeds raised by Impetuous Winds                                     |
| `packages/genshin-world/src/services/kit/effects/getBuffedCombatant.ts`            | A hit's pricing: its buffs, its passives' bonuses and Enduring Rock's DMG                                        |
| `packages/genshin-world/src/services/kit/startNextKitAction.ts`                    | A skill's cooldown as it starts: the kit's own multiplier, then Impetuous Winds'                                 |
| `packages/genshin-world/src/services/party/drownParty.ts`                          | A drowning: every member's energy and a tenth of its Max HP                                                      |
| `packages/genshin-world/src/services/party/reviveParty.ts`                         | A fallen team brought back at 35% of its Max HP                                                                  |
| `packages/genshin-world/src/services/map/findNearestLandmark.ts`                   | The loaded statue nearest the body, where a fallen team is jumped to                                             |
| `packages/genshin-world/src/services/party/constants.ts`                           | The team size, the cooldown, the default teams and the keys                                                      |
| `packages/genshin-world/src/components/World/Character/Index.vue`                  | Steps the field's kit, its cooldowns, a drowning, a burst on a switch, a strike's resonances and the stamina cut |
| `packages/genshin-world/src/components/World/Session/Index.vue`                    | Keeps the characters and the party, switches on the keys, and respawns a fallen team                             |

## Notes

- **The cooldown is the single player's.** The wiki gives one second; co-op splits the four slots between players and is out of the world's scope.
- **Only the character on the field takes an enemy's strike.** The others' HP falls only by a drowning, which takes every member's energy and a tenth of its Max HP together, while their cooldowns keep running off the field.

## Sources

- [Party](https://genshin-impact.fandom.com/wiki/Party), Genshin Impact Wiki: four members, the one second switch cooldown, Party Setup on `L`, the four default teams that are never disbanded, a team filled from the left and a team of none never deployed.
- [Fallen Character](https://genshin-impact.fandom.com/wiki/Fallen_Character), Genshin Impact Wiki: a fallen character is never switched in, and "Character is down" for a fallen character on the field's slot or a team of fallen characters deployed; a fallen character's energy lost, the fallen team revived at the nearest waypoint with 35% HP, and drowning's 10% of every member's Max HP and all its energy.
- [Health](https://genshin-impact.fandom.com/wiki/Health), Genshin Impact Wiki: the next character brought on when one falls, and the HP keeping its share as the Max HP changes.
- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: party members 1 to 4 on the number keys and a pad's up, right, left and down.
- [Team Bonus](https://genshin-impact.fandom.com/wiki/Team_Bonus), Genshin Impact Wiki: each Elemental Resonance's effect, Enduring Rock's Geo RES and DMG, Sprawling Greenery's Elemental Mastery for 6 seconds after each reaction and its two amounts counted independently, and Impetuous Winds' skill cooldown, stamina and movement.
- [Movement SPD](https://genshin-impact.fandom.com/wiki/Movement_SPD), Genshin Impact Wiki: the walking, running, sprinting, dashing and jumping that Movement SPD alters.
