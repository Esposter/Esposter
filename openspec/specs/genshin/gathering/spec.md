## Purpose

The plants and specialties the official map marks, placed by the fit into each region as gathering points, picked with F and kept gone until their respawn. A local specialty comes back 46 hours after it is picked, as the wiki gives it, and a cooking ingredient at the daily reset that follows. The gather table's refresh ids name no policy in the dump, so the category settles it (`{data-root}/genshin-parity/text/ExcelBinOutput/GatherExcelConfigData.json`, checked against `{data-root}/genshin-parity/text/ExcelBinOutput/RefreshPolicyExcelConfigData.json`).

## Requirements

### Requirement: Gathering points stand where the official map marks their item

Gathering points SHALL stand in each region where the official map marks their item.

#### Scenario: Plant stands at its official map mark

- **GIVEN** the official map marks a plant in a region
- **WHEN** the region is loaded
- **THEN** a gathering point for the plant stands at that mark

### Requirement: An item the game excludes is not a gathering point

An item the game excludes SHALL NOT be a gathering point.

#### Scenario: Mining item is not a gathering point

- **GIVEN** an item is drawn by a mining outcrop instead
- **WHEN** the gathering points are built
- **THEN** no gathering point is made for that item

### Requirement: F picks a gathering point into the bag

Pressing F on a gathering point SHALL pick its item into the bag.

A gathering point SHALL stay standing when the bag has no room for it.

#### Scenario: Pick puts the item in the bag

- **GIVEN** a gathering point is standing in reach and the bag has room
- **WHEN** the player presses F on it
- **THEN** the item goes into the bag and the point is gone

#### Scenario: Full bag leaves the point standing

- **GIVEN** a gathering point is standing in reach and the bag is full
- **WHEN** the player presses F on it
- **THEN** the point stays standing

### Requirement: A picked local specialty stands again after 46 hours

A picked local specialty SHALL stand again 46 hours after it was picked.

#### Scenario: Specialty is back after 46 hours

- **GIVEN** a local specialty was picked
- **WHEN** 46 hours have passed
- **THEN** the specialty stands again

#### Scenario: Specialty is still gone before 46 hours

- **GIVEN** a local specialty was picked
- **WHEN** less than 46 hours have passed
- **THEN** the specialty stays gone

### Requirement: A picked cooking ingredient stands again at the next daily reset

A picked cooking ingredient SHALL stand again at the game's next daily reset after the pick, which is 04:00 on the game's clock.

#### Scenario: Ingredient picked before the reset is back at the reset

- **GIVEN** a cooking ingredient was picked before the game's daily reset
- **WHEN** the game's daily reset comes
- **THEN** the ingredient stands again

### Requirement: An ore is struck and broken rather than picked

An ore SHALL NOT be picked with F, and SHALL be broken by the hits that land on it.

#### Scenario: F does not pick an ore

- **GIVEN** an ore is standing in reach
- **WHEN** the player presses F on it
- **THEN** nothing is picked

### Requirement: An ore breaks once its hits reach its poise requirement

An ore SHALL break once the poise its landed hits deal reaches its requirement for the kind of hit, blunt or melee.

#### Scenario: Burst breaks a crystal chunk in one hit

- **GIVEN** a burst's blunt hit lands on a crystal chunk
- **WHEN** the hit is dealt
- **THEN** the crystal chunk breaks

#### Scenario: Hit that is neither blunt nor melee adds nothing

- **GIVEN** a hit is neither blunt nor melee
- **WHEN** it lands on an ore
- **THEN** the ore takes no poise from it

#### Scenario: Claymore attacks, plunges and Geo damage strike blunt

- **GIVEN** a claymore's normal attack, a sword's or polearm's plunge, or a hit that deals Geo damage lands on an ore
- **WHEN** the hit is dealt
- **THEN** the ore takes its poise as a blunt hit, against the blunt requirement

#### Scenario: A Geo character's physical normal attack and a listed exception do not strike blunt

- **GIVEN** a Geo character's normal attack, which deals no element, lands on an ore, or Ningguang's plunge lands on it
- **WHEN** the hit is dealt
- **THEN** the ore takes its poise as a melee hit or none, and Ningguang's plunge is not blunt

#### Scenario: A Geo Traveler's skill strikes blunt, as the element it deals is Geo

- **GIVEN** a Geo Traveler's skill, which takes her wielder's element, lands on an ore
- **WHEN** the hit is dealt
- **THEN** the ore takes its poise as a blunt hit (where Geo damage is blunt)

#### Scenario: Converted poise from an infusion does not reach an ore

- **GIVEN** a hit's damage has been converted by an infusion
- **WHEN** it lands on an ore
- **THEN** the converted poise does not count toward breaking the ore

#### Scenario: Overloaded explosion strikes ores nearby

- **GIVEN** an Overloaded reaction lands on an enemy
- **WHEN** the explosion resolves
- **THEN** ores within three metres of that enemy take a blunt hit of ninety poise

### Requirement: A broken ore drops its certain piece where it lay

A broken ore SHALL drop its certain piece where it lay.

#### Scenario: Broken ore drops its certain piece

- **GIVEN** an ore breaks
- **WHEN** it breaks
- **THEN** its certain piece drops where it lay

### Requirement: A broken ore drops one more for each of two draws that comes under ten per cent

A broken ore SHALL drop one more for each of two draws that comes under ten per cent.

#### Scenario: Extra piece drops on a successful draw

- **GIVEN** an ore breaks
- **WHEN** each of its two draws comes under ten per cent
- **THEN** one extra piece drops for each draw that succeeds

### Requirement: An ore stands again on its own respawn

A broken ore SHALL stand again on its own respawn: an iron chunk at the daily reset, a white iron chunk or starsilver two days after it breaks, and a crystal chunk, amethyst lump or condessence crystal three days after it breaks.

#### Scenario: White iron chunk is back two days after breaking

- **GIVEN** a white iron chunk breaks
- **WHEN** two days have passed
- **THEN** it stands again

#### Scenario: Crystal chunk is back three days after breaking

- **GIVEN** a crystal chunk breaks
- **WHEN** three days have passed
- **THEN** it stands again

## Sources

- [Local Specialty](https://genshin-impact.fandom.com/wiki/Local_Specialty), Genshin Impact Wiki, cached at `{data-root}/cache/genshin-wiki/Page_Local_Specialty.json`, line 6: "After a local specialty is harvested, it will respawn after 46 hours." The [Reset](https://genshin-impact.fandom.com/wiki/Reset) page, cached at `{data-root}/cache/genshin-wiki/Page_Reset.json`, line 48, lists All Local Specialties at 48 hours; the requirement keeps the 46 hours of the Local Specialty page, which `packages/genshin-world/src/services/gathering/constants.ts` also sets.
- [Mineral](https://genshin-impact.fandom.com/wiki/Mineral), Genshin Impact Wiki, cached at `{data-root}/cache/genshin-wiki/Page_Mineral.json`: an ore needs Poise Damage from melee or Blunt attacks to break (line 29), and a broken regular ore drops one for certain and one more for each of two draws at 10 per cent (line 20; the Chasm's special ores drop two for certain, line 21).
- [Blunt Attack](https://genshin-impact.fandom.com/wiki/Blunt_Attack), Genshin Impact Wiki, cached at `{data-root}/cache/genshin-wiki/Page_Blunt_Attack.json`: plunges by sword, claymore and polearm users are blunt, and catalyst plunges are not listed (line 6); Ningguang's plunge is excepted from the Geo rule (line 8).
- `{data-root}/genshin-dump-backup-6.6/ExcelBinOutput/GatherExcelConfigData.json`: the row of Magical Crystal Chunk, item 101004 (line 68), saves nothing (`GATHER_SAVE_TYPE_NONE`, line 74), so the mining outcrop's drop is no gathering point.
- `packages/genshin-world/src/composables/useWorldPickups.ts`: the pick ups leave an ore out (line 113, `kind in OreItemIdBreakPoiseMap`), and a point is kept as picked only once the bag has taken its item (line 181, `addition.overflow === 0`).

## Open

- [ ] **Gathering points stand where the official map marks their item** — no source yet: a comparison of the gathering points with `label-tree.json` and `points.json` under `{data-root}/genshin-parity/references/interactive-map/`, which no record keeps.
- [ ] **A burst breaks a crystal chunk in one hit** — no source yet: no frame of the Zhongli clip `{data-root}/genshin-parity/captures/yt-EWYe-MYjmqU-ore-zhongli.mp4` in genshin-parity's captures has been checked.
- [ ] **Claymore attacks, plunges and Geo damage strike blunt, and a Geo Traveler's skill does too; a Geo character's normal attack does not** — contradicted by `{data-root}/cache/genshin-wiki/Category_Ningguang_Talents.json` (the page Sparkling Scatter, its Normal Attack blunt at line 46): Ningguang's normal attack deals Geo and is blunt, as `{data-root}/cache/genshin-wiki/Page_Blunt_Attack.json` line 134 lists it; only a physical normal attack is not blunt, which the requirement's scenario reads.
- [ ] **Converted poise from an infusion does not reach an ore** — no source yet: `{data-root}/cache/genshin-wiki/Page_Elemental_Infusion.json`, fetched for this check, gives no poise rule for an infused hit, and `{data-root}/cache/genshin-wiki/Page_Mineral.json` line 29 counts melee poise without naming infusions; a recording of an infused sword's normal attack striking an unbroken ore would settle it.
- [ ] **Ores stand again on their own respawn: an iron chunk at the daily reset, a white iron chunk or starsilver after two days, a crystal chunk, amethyst lump or condessence crystal after three** — contradicted by `{data-root}/cache/genshin-wiki/Page_Reset.json` line 19: iron chunk nodes spawn 4 hours before the daily reset, at 0:00 server time. Its line 50 gives the two-day group, and its line 54 the three-day one for crystal chunks outside a Mining Outcrop and for amethyst lumps; no cached page names a respawn for condessence crystal.
