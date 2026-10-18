# Party

This page builds on the [party](../../specs/genshin/party/design.md) as built: the teams, their rules, the deployed one and the member on the field, switched by `1` to `4` and `Left Alt` with them, and the Elemental Resonance effects built so far. It also builds on the [HUD](../../specs/genshin/hud/design.md), whose portraits down the right show the deployed team, and on [combat](../../specs/genshin/combat/design.md), whose damage makes a character fall.

## Decisions

- **Party Setup is a screen of its own on `L`.** It shows the deployed team, slot by slot, over the region's background, and arrows at its edges step between the teams. Configure Team lists every team with its name, members and elements, and adds or disbands one; Quick Setup picks members in order. The [screens](../../specs/genshin/screens/design.md)' placeholder holds its shortcut until then.
- **The choice of the next member and the game over screen.** The game plays the fall, lets nobody switch until it ends, then asks the player for the next member; once every member is down, the game over screen offers a revive at the nearest teleport waypoint with 35% HP. The next member is the player's choice from the end of the fall, the world bringing none on its own, and the HUD asks for it under the team. The game over screen, `components/GameOver/Index.vue`, opens when the whole team has fallen, with its title and a Revive button; Revive brings the team back at the nearest unlocked teleport waypoint, at 35% HP, and stays where it fell when none is unlocked. The revive is at the nearest waypoint and no statue, since the spec and the wiki give a waypoint and nothing names a statue. The screen's look follows the wiki's description and is provisional until a recording measures it. This change corrects the [party](../../specs/genshin/party/design.md) page's statue when it archives.
- **The fall lasts two seconds, provisionally.** The wiki gives no length for a fall, which the game plays as its fallen animation and voice-over, so `PARTY_FALL_SECONDS` is an estimate until a recording of a fall is measured. The fall is a countdown on the party that the save does not keep, so a reload onto a fallen member asks for the next one at once.
- **A Moondrift counts as a shield for Enduring Rock.** The [Enduring Rock](https://genshin-impact.fandom.com/wiki/Enduring_Rock) page of the Genshin Impact Wiki gives the Moondrift clause in those words: DMG dealt rises and enemies' Geo RES falls "when characters protected by a shield or when Moondrifts formed by Lunar-Crystallize reactions are nearby". The check takes the Moondrifts the party holds and the field character's position, within the radius a Moondrift is near a character at. The kit paths that strike or price a hit pass that position, and a read without one, the healing path, counts no Moondrift, since healing takes none of Enduring Rock's DMG.
- **A downed member's kit takes no press.** While the member on the field is down, its kit starts nothing from a press, while the team's effects, Moondrifts and enemy statuses keep stepping, so a fall ends the member's own actions and not the world's.
- **The party is kept between visits**, as the game keeps it on its server: the teams, the deployed one, the member on the field and who is down, beside the player's characters. It is a slice of the world's [save](../../specs/genshin/save-data/design.md), added as every slice after the wallet is, [latest shape only](../../specs/architecture/persisted-data-latest-shape-only/design.md), and a new player's save holds the new player's party. The save is kept by the account as well as in the browser, so the party is too.
- **The save holds who is down, not each member's HP.** A reload brings every standing member back at full HP, with no energy or cooldown spent, which is the down state the [party spec](specs/genshin/party/spec.md) keeps. A guest's party merges into the account's by the account's copy, as the bag does. The world reads the kits of the deployed team the save holds rather than the starting team's, so a team deployed on a visit has its kits built before the world opens.
- **Party Setup's layout is the 4.0 screen, read off a public clip.** The current Party Setup, its region's background behind four standing members, is shown at 1080p and 60 frames a second in a public clip ([NEW PARTY SETUP SCREEN](https://www.youtube.com/watch?v=greLeGJE-Jg), 57 seconds). The screen is built from that clip's frames; the build does not wait for a recording, which measures it again later.

## How it works

```mermaid
flowchart TD
  L["L, or the Paimon menu's Party Setup"] --> SETUP["Party Setup: the deployed team, slot by slot"]
  SETUP -->|"arrows"| OTHER["Another team"]
  SETUP -->|"Deploy"| DEPLOY{"Anybody standing in it?"}
  DEPLOY -->|yes| FIELD["Its first member standing takes the field"]
  DEPLOY -->|no| DOWN["Character is down"]
  SETUP -->|"Configure Team"| CONFIGURE["Add, rename or disband a team"]
  FALL["The member on the field falls"] --> NEXT{"Anybody standing?"}
  NEXT -->|yes| CHOOSE["The player chooses the next member"]
  NEXT -->|no| OVER["Game over: revive at the nearest waypoint with 35% HP"]
```

## Scope

**Today:** the party's state and rules, switching on `1` to `4` and a pad's directions in play, a burst on a switch with `Left Alt`, the teams added, renamed and disbanded as rules, Elemental Resonance as a rule with its built effects on the stats, the strikes, the reactions, the skills and the stamina, the deployed team down the [HUD](../../specs/genshin/hud/design.md)'s right, and the [character screen](../../specs/genshin/character-screen/design.md) on `C`.

**This adds, in order:**

```text
packages/genshin-interface/src/components/PartySetupScreen/Index.vue
packages/genshin-world/src/components/Party/Screen/Index.vue
```

1. **Party Setup's screen, built from its clip's frames.** Its 57-second clip (`greLeGJE-Jg`, `--from 0 --to 57 --name party-setup`) is cut and framed the way [the cooking screen](../archive/2026-10-18-genshin-cooking/design.md) is, then `genshin:parity frames` over it at one a second; the builder looks through them and keeps, through `genshin:parity frame <capture> --at <s> --name party-setup`, one showing the deployed team at rest with its name, arrows and buttons in view. Build `PartySetupScreen` in `genshin-interface` (`components/PartySetupScreen/Index.vue` and `Index.fixture.ts`): the team's name, the arrows stepping between teams, four slots each naming its member with level and element mark (an empty slot's plus), and the Deploy, Configure Team and Quick Setup buttons, placed off that frame and worded by text id where `GameTextKey` holds the word. The added team's name, "Team Standing By", is an English constant marked provisional until the decoded text holds its text id. Its world wrapper `components/Party/Screen/Index.vue` holds the `Party` and emits the team stepped to and the deploy through `deployPartyTeam`'s rules, and `components/World/Session/Index.vue` fills `MenuScreen`'s `ScreenKind.PartySetup` slot with it, as it fills the Wish slot, in place of `Menu/Placeholder`. The members stand as 2D name plates in this slice; their models follow the character screen's in a later one. A reference for the frame goes in `ParityReferenceMap`, its compare is queued for the user's eyes, and the standing members' models and Configure Team and Quick Setup's screens follow over the same rules.
2. **The choice of the next member and the game over screen**, in place of the automatic next member and the statue's revive.
3. **Elemental Resonance's effects that need a mechanism not built yet**, each one the party's or the combat's to add when the mechanism lands:
   - The affliction durations: Fervent Flames' Cryo, Soothing Water's Pyro, High Voltage's Hydro and Shattering Ice's Electro, each affecting the party member for 40% less time. Built: each member holds an `ElementalState` of its own, runtime only and never saved, which `applyPartyMemberElement` writes through `applyElement`. A Resonance of the team that shortens the element scales the attack aura's decay rate there (`auraDecayRateScale`), since `applyAura` keeps an aura and sets no rate. The 40% is provisional, from the Team Bonus page. An enemy's landed strike applies its kind's `attackElement` to the struck member at `ENEMY_STRIKE_GAUGE`, one Gauge Unit, provisional from the Elemental Gauge Theory page. The one kind placed, Hilichurl Fighter, has no attack element, since its Attacks section gives every attack as Physical DMG, so no member takes an element in play yet. Not built: each elemental attack's own gauge (the wiki gives 1, 1.5, 2 and 4), and no HUD shows a member's aura.
   - High Voltage's Electro particle, 100% on Superconduct, Stellar-Conduct, Overloaded, Electro-Charged, Lunar-Charged, Quicken, Aggravate and Hyperbloom, on a 5 second cooldown. Built for each listed reaction the engine has (Stellar-Conduct is not a reaction type yet), on the strike, the reach and the elemental ticks (`getReactionParticleDrops`), with the team's cooldown kept on `Party.particleCooldownSecondsMap` and stepped with the cooldowns. The list and the 5 seconds are provisional, from the Team Bonus page and the Energy page. Not built: a skill hit's own particle, which the Energy page gives with a cooldown of its own and waits on per-character kit data.
   - Enduring Rock's Moondrift clause. A Moondrift formed by Lunar-Crystallize nearby gives the same DMG and Geo RES as a shield does; Moonsign is built, so this clause is built with this change.
   - Sprawling Greenery's Hyperbloom and Burgeon, which a Dendro Core's reactions give and no strike triggers yet.
4. **The party kept between visits**, as the save's party slice the Decisions describe, which the account and the browser keep as they keep the rest of the save.

## Key files

| File                                                                     | Role                                                 |
| :----------------------------------------------------------------------- | :--------------------------------------------------- |
| `packages/genshin-world/src/models/party/Party.ts`                       | The state Party Setup edits and the HUD reads        |
| `packages/genshin-world/src/services/party/addPartyTeam.ts`              | The team rules Configure Team's add goes through     |
| `packages/genshin-world/src/services/party/disbandPartyTeam.ts`          | The team rules Configure Team's disband goes through |
| `packages/genshin-world/src/components/World/Session/Index.vue`          | Fills Party Setup's screen slot                      |
| `packages/genshin-world/src/services/screen/ScreenKindGameTextKeyMap.ts` | Party Setup's title, already the game's              |
| `packages/genshin-world/src/composables/useWorldCombat.ts`               | Opens the game over when the team falls, and revives |
| `packages/genshin-world/src/components/GameOver/Index.vue`               | The game over screen and its Revive                  |
| `packages/genshin-world/src/components/Hud/Party/Index.vue`              | The next-member prompt under the team                |
| `packages/genshin-world/src/services/party/applyPartyMemberElement.ts`   | A member's element, shortened by a Resonance         |
| `packages/genshin-world/src/services/party/getReactionParticleDrops.ts`  | A reaction's High Voltage particle on its cooldown   |
| `packages/genshin-world/src/services/party/stepPartyElementalStates.ts`  | Each member's elemental state, moved each step       |
| `packages/genshin-world/src/services/kit/strikePartyMember.ts`           | An enemy's strike, and its attack element applied    |
| `packages/genshin-world/src/models/enemy/EnemyKindTraits.ts`             | A kind's attack element, beside its energy element   |

## Sources

- [Party](https://genshin-impact.fandom.com/wiki/Party), Genshin Impact Wiki: Party Setup, Configure Team and Quick Setup, the four default teams, "Team Standing By", fifteen teams at most, the deployed team never disbanded, and the region's background.
- [Fallen Character](https://genshin-impact.fandom.com/wiki/Fallen_Character), Genshin Impact Wiki: the fall, nobody switching during it, the game over and the revive at the nearest waypoint with 35% HP.
- [Team Bonus](https://genshin-impact.fandom.com/wiki/Team_Bonus), Genshin Impact Wiki: each affliction duration, High Voltage's particle and its cooldown, and the Moondrift and Lunar-Bloom clauses.
- [Energy](https://genshin-impact.fandom.com/wiki/Energy), Genshin Impact Wiki ("Elemental Particle" redirects to it): High Voltage's particle and its cooldown, the enemy's particles at health thresholds, and a skill's particles with a cooldown of their own.
- [Hilichurl Fighter](https://genshin-impact.fandom.com/wiki/Hilichurl_Fighter), Genshin Impact Wiki: the infobox's damage type and every attack in the Attacks section, all Physical DMG.
- [Elemental Gauge Theory](https://genshin-impact.fandom.com/wiki/Elemental_Gauge_Theory), Genshin Impact Wiki: the 1, 1.5, 2 and 4 Gauge Units most enemy attacks apply.
