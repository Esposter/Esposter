# Domains

A domain is the kind of instance the [domains](../../specs/genshin/domains/design.md) page defines: a challenge in a scene of its own, cleared for a reward. Challenge domains give artifacts, talent materials and weapon ascension materials, the materials every growth page here spends; one-time domains reward their first clear; the trounce domains, where the weekly bosses wait, are the bosses' page, which enters them as this page enters any. A domain's reward is claimed with [Original Resin](../genshin-original-resin/design.md), the domains open by [Adventure Rank](../genshin-adventure-rank/design.md), and they are fought with the [character kits](../genshin-character-kits/design.md), so this page waits on all three.

The [domains page](../../specs/genshin/domains/design.md) holds the opening rules, each kind by its Adventure Rank and by the day of the week. What is left here is the world's side of a domain and its challenge.

## Decisions

- **An entrance is a landmark, and a waypoint once unlocked.** Each permanent domain's entrance is a `LandmarkKind` of its own, and joins the jumps once unlocked, as the game teleports to it ([map unlocking](../genshin-map-unlocking/design.md)). No `LandmarkKind` is added until the reader that places it exists.
- **The arrival is provisionally the entrance's own place.** PROVISIONAL: a jump lands at the entrance's `arrival`, which the writer sets to the entrance's own place (its position, turn and height above the ground) until the domain's scene export gives its transfer point, which the fit then replaces. `JUMP_LANDMARK_KINDS` holds the kind, so an entrance is listed with the statues and waypoints, and an unlocked one is a jump target through `computeUnlockedJumpLandmarks`. Its area is filled and its mark drawn as a statue's are, and the HUD's pointer names a locked one within reach, both judgements the wiki does not settle and both PROVISIONAL until a recording shows them.
- **An entrance's place is its scene point.** `DungeonEntryExcelConfigData` names each entrance's scene and its point (`dungeonEntryId`), and the scene's points (`BinOutput/Scene/Point/scene3_point.json`, held) hold that point, under the category `points` and in a kind of its own, at `tranPos` (a `{x, y, z}` vector, each zero component left out), with its area at `EABBCMGNLEL` (left out when zero), the fields the transport points use: entry row 1's point 48 is a Domain of Blessing's, at about (2498, 264, -1558) in area 106. So no streaming record and no map fit is needed. The entry's `type` gives the kind: `DUNGEN_ENTRY_TYPE_RELIQUARY` is Blessing, `DUNGEN_ENTRY_TYPE_WEAPON_PROMOTE` Forgery and `DUNGEN_ENTRY_TYPE_AVATAR_TALENT` Mastery; the other types are one-time, trounce and event entrances, left for their own items.
- **An entrance draws a stand-in until its kit exists.** Each entrance draws one pillar, in one colour, at its published arrival, which is the entrance's own place until the scene export gives the transfer point. The kit is replaced, not extended, when the domain's artwork is built.
- **The screen's words are the game's, by text id.** The screen shows the Domain title (text hash 4043227537), the recommended level (`UI_QUEST_RECOMMEND_LEVEL`), the enemy level (hash 669745132, one of four ids that share its English), the Enter Domain button (`UI_DUNGEON_ENTRY_47`), the Adventure Rank a refused level asks for (`QUEST_DIALOG_DETAIL_PLAYER_LEVEL_NEED`) and the closed state. PROVISIONAL: the closed state borrows a hall's timer string (`UI_BEYOND_HALL_LIST_HALL_LEFTTIME_CLOSE`), not a domain's words, and a level's own name is not shown, since the published `domains` dataset holds no text id for a domain's name.
- **The stand-in arena is beside the entrance.** PROVISIONAL: an entered level lands on a flat place `DOMAIN_ARENA_OFFSET` (30 world units) east of its entrance's arrival, facing the same turn (`computeDomainScenePose`), on the jump's fade. Leaving or the challenge's end jumps back to the arrival. The offset is replaced by the scene export's transfer point, and the arena pad is not drawn yet.
- **A domain is a scene of its own.** Its interior is the game's own dungeon scene, laid out from that scene's data and derived as a region is ([scene derivation](../../specs/genshin/scene-derivation/design.md)). F at the entrance opens the domain's screen, and entering fades to the scene as a jump fades to its landmark; leaving, or the challenge failing, fades back to the entrance.
- **Levels by Adventure Rank.** A challenge domain has several levels, each opened at its Adventure Rank, with its recommended level, its enemies' level and its ley line disorder, read from `DungeonExcelConfigData` (`limitLevel`, `levelRevise`, `previewMonsterList`) and its entry table. The player chooses one before entering.
- **The challenge is the domain's.** Its enemies come in the waves its scene sets, against its time limit, and a ley line disorder changes the fight as its description says, written as a module over the kits' shared effects. Clearing it raises the Petrified Tree at the end.
- **The days each kind sets.** A Domain of Forgery's weapon materials and a Domain of Mastery's talent materials are each open on two set days and every Sunday, the days turning at the game's daily reset. The set days come from the entry's `descriptionCycleRewardList`: its three day lists are the Monday and Thursday, Tuesday and Friday, and Wednesday and Saturday materials in that order, which the wiki's location pages confirm for all sixteen entries. A level's reward preview names its material, so the level takes that pair's days. Four entries (2, 3, 10 and 11) have one level per rung whose preview names all three materials; those are open on Sunday only. A Domain of Blessing is open every day, so the three-day rule of the wiki's Domain page applies to Forgery and Mastery only. The rule is built ([domains page](../../specs/genshin/domains/design.md)); the daily table is not read, since the entries' lists give the same days. - **The reward is the resin claim.** The Petrified Tree is claimed with resin as any blossom is ([Original Resin](../../specs/genshin/original-resin/design.md)), its artifacts rolled by the [artifact enhancement](../../specs/genshin/artifact-enhancement/design.md) page's rules.
- **One-time domains reward their first clear.** Their Adventure EXP, Primogems and any recipe are given once, by their reward table row, and they stay open with nothing more to give.
- **A first clear is kept in the save.** The cleared one-time domains are a unique list of entry ids in the save (`clearedDomains`, read as `clearedDomainIds`). A merge of a guest save into an account keeps the domains cleared on either, so a clear made as a guest is not claimed again on the account.

## How it works

```mermaid
flowchart TD
  ENTRANCE["F at an unlocked entrance"] --> SCREEN["The domain screen: its levels, today's materials"]
  SCREEN --> OPEN{"Level open by Adventure Rank, and open today?"}
  OPEN -->|"no"| SCREEN
  OPEN -->|"yes"| ENTER["Fade into its scene, the party set"]
  ENTER --> FIGHT["Waves against the time limit, under its ley line disorder"]
  FIGHT -->|"time out or every member down"| BACK["Fade back to the entrance"]
  FIGHT -->|"cleared"| TREE["Petrified Tree"]
  TREE -->|"claimed with resin"| REWARD["Artifacts or materials, Mora, Adventure EXP"]
  TREE --> BACK
```

## Scope and order

**Today:** the opening rules are built, as the [domains page](../../specs/genshin/domains/design.md) records. Nothing enters a domain, and nothing gives a domain's materials.

**This adds, in order:**

```text
scripts/src/services/genshinAssets/domains/
├── toDomainEntrance.test.ts
└── writeDomainEntrances.ts
```

1. **The entrances, read from the scene points.** `DungeonExcelConfigData`, `DungeonEntryExcelConfigData` and `DailyDungeonConfigData` are in the dump at the install's build, so the step reads them from there with no fetch list to extend. Then `writeDomainEntrances.ts`, behind a `genshin:assets domains` subcommand on the pattern of `forgingCommand`, reads every entry row of scene 3 whose type names a `DomainKind`, takes its point from `scene3_point.json` (a row whose point is missing is counted and left out), files it under the fitted region of the official map point nearest it within reach, as a resident is, and under the landmark nearest it in that region, and writes it into that region's `packages/genshin-world/src/data/regions/<region>.json` landmarks as a `LandmarkKind.DomainEntrance` with its domain kind and the entry's id, its place carried round the Windrise origin (`readWorldOrigin`) as `chests/buildChestPlaces.ts` carries its points. `LandmarkKind` gains `DomainEntrance`, which no kit draws yet. The proof is `toDomainEntrance.test.ts`: a dumped entry row and its point become the landmark at the point's x less the origin's x and the origin's z less the point's z, with the kind its type names, and a row of `DUNGEON_ENTRY_TYPE_NORMAL` gives none.
2. **The entrance's kit and its screen**: a stand-in kit drawn at each entrance, then the screen F opens, listing its levels and today's materials over the built opening rules.
3. **The days' schedule and the levels by rank**, read from the tables item 1 fetches. The days' rule is built.
4. **Entering a domain's scene and leaving it**, on the jump's fade.
5. **The challenge**, its waves, time limit and failure, with the first domain of Mastery carried. A domain's scene is laid out from its own scene data, which waits on the scene export the other machine is making.
6. **Ley line disorders**, each a module.
7. **One-time domains.**

## Data and measures

- **Read from the game's tables:** `DungeonExcelConfigData`, `DungeonEntryExcelConfigData`, `DailyDungeonConfigData` and the domains' reward rows; each domain scene's layout from its own scene data, as a region's is read. The first three are on AnimeGameData's master and are fetched into the dump by item 1.
- **Read from the wiki:** each domain's rolled drops by level, and the weekday schedule the daily table's fields are matched against. The wiki answers its API through the persona's reader (`readWikiPageText`), so neither waits on a source.
- **Measured:** the fade into and out of a domain, off a recording, as the jump's fade is. The clip is listed on the [roadmap](../genshin-roadmap/tasks.md).

## Blocked

- **The Petrified Tree's claim (3.3).** The claim is built: `claimPetrifiedTree` takes the offer the player chose from the claim prompt (`computeBlossomClaimPrompt` for `BlossomKind.Domain`, which offers one, two or condensed claims) and draws its rewards once per claim from a passed draw, through `claimResinReward`, the one resin claim the boss and ley line claims use. Its tests cover the single and the double spend and the refusal. Task 3.3 stays open for two parts: the prompt surface, which F reaches only from a cleared domain's tree (3.2), and the tree's reward draw. The draw's rows are unread: `BlossomRefreshExcelConfigData` carries only the talk, challenge and group challenge show types, and the two resin chests in `BlossomChestExcelConfigData` are not yet tied to the domain blossom.
- **The scene (3.1, 3.2).** A domain's scene is laid out from the client's scene data, which the dump does not hold: it has only `BinOutput/Scene/Point/scene3_point.json`. The PC's export must give, for each domain's scene (its `sceneId` in the dungeon rows): the scene's points file (`BinOutput/Scene/Point/scene<sceneId>_point.json`, for the point the player enters at and the one the player returns to), its `sceneGroups/*` (the wave monsters and the dummy points the members return to), and the challenge's time limit, which `DungeonExcelConfigData` does not hold (its `settleCountdownTime` is 999 on the domains read).
- **One-time domains (3.4).** The first-clear rule and the save field are built. The rule has no caller yet: a clear is raised only by the scene (3.2). Their reward rows are unread, so the rewards are passed in until they are. Stored Genshin saves lack `clearedDomains`, so the dev backfill gives each one `clearedDomains: []`.

## Key files

| File                                                                    | Role after the change                                   |
| :---------------------------------------------------------------------- | :------------------------------------------------------ |
| `packages/genshin-world/src/models/world/LandmarkKind.ts`               | Gains the domain entrance                               |
| `packages/genshin-world/src/services/map/constants.ts`                  | `JUMP_LANDMARK_KINDS` gains the domain entrance         |
| `packages/genshin-world/src/components/World/Session/Index.vue`         | Enters a domain's scene and returns to the world        |
| `packages/genshin-world/src/models/enemy/EnemyCamp.ts`                  | A domain's waves, as camps of its scene                 |
| `packages/genshin-world/src/models/domains/DomainSchedule.ts`           | A domain's kind and levels, the schema the screen reads |
| `packages/genshin-world/src/services/domains/checkIsDomainLevelOpen.ts` | Whether a level is open at the rank on the day          |
| `scripts/src/services/genshinAssets/domains/toDomainLevels.ts`          | Builds each domain's levels and days from the tables    |

## Sources

- [Domain](https://genshin-impact.fandom.com/wiki/Domain), Genshin Impact Wiki (read through `api.php?action=parse&prop=wikitext&page=Domain`, since the page itself refuses scripted fetches): entrances acting as waypoints, the ranks and quests that open each kind, each Forgery or Mastery stage open on two set days a week and Sunday, a Domain of Blessing every day, one-time domains, and the Petrified Tree claimed with resin. Also read: [Domain of Blessing](https://genshin-impact.fandom.com/wiki/Domain_of_Blessing), [Domain of Forgery](https://genshin-impact.fandom.com/wiki/Domain_of_Forgery) and [Domain of Mastery](https://genshin-impact.fandom.com/wiki/Domain_of_Mastery) (the ranks and the reserved days), and the template [Domain by Weekday](https://genshin-impact.fandom.com/wiki/Template:Domain_by_Weekday) (Monday/Thursday, Tuesday/Friday and Wednesday/Saturday pairs of stages, Sunday common).
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the dungeon, dungeon entry and daily dungeon tables, the last with its weekday fields scrambled.

## Reference

- `domain-entry.mkv` — standing at a domain's entrance and pressing F to enter, the fade into its scene, then the fade back out when the domain is left, 30 seconds at most. The fade's durations are measured from it, as the teleport's are. Partly found 2026-10-11: https://www.youtube.com/watch?v=V7SVLH8V5RE; still sought: the fade-out when the domain is left, not clipped; the candidate was found from its title only and its timestamps are not verified.
