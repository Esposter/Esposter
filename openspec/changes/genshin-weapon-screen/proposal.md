# Weapon screen

## Why

The weapon enhancement's rules are built: a weapon levels from ores and fodder at Mora, ascends at each phase's cap and refines to rank five, each as a pure service. No screen calls them, so a player cannot level, ascend or refine a weapon in the game. The character screen covers the character who wields a weapon, not the weapon itself, so the screen that spends on a weapon needs a spec of its own.

## What Changes

The weapon screen shows a weapon the player holds and spends on it through the weapon enhancement's rules.

- The screen shows the weapon's name, rarity, level, EXP towards the next level, ascension phase and refinement rank.
- Enhance spends the ores and fodder weapons the player picks, and the Mora their EXP costs.
- Ascend is offered only at a phase's level cap, and spends the next phase's Mora and items once the Adventure Rank allows it.
- Refine takes one copy or one refinement material, plus that rank's Mora, up to rank five.
- A refused action changes nothing.

## Capabilities

- **genshin/weapon-screen** (new)

## Waiting on

- `openspec/changes/genshin-character-kits/`: a weapon's passive takes effect through the kits' shared effects, so the passive's effect waits on the kits, whose tasks are not yet started. The three actions do not wait on them. The passive's name and per-rank descriptions are the weapon enhancement's requirement, shown on this screen once it lands.
- Game exports, which the three action labels' text ids are read from (per the change's needs). The equipment page's ids are `UI_EQUIP_PAGE_LEVELUP_BUTTON`, `UI_EQUIP_PAGE_STARUP_BUTTON` and `UI_EQUIP_PAGE_AWAKEN_BUTTON` ("Enhance", "Ascend", "Refine" in English), but `pnpm -C scripts genshin:text write` cannot run on the PC that holds the install's text: three ids the generated text already uses (`UI_ACTIVITY_LOLI_RUN_JUMP`, `tips_enter_game`, `UI_ACTIVITY_LOLIGOLF_DISTANCE`) are missing from its `ExcelBinOutput/ManualTextMapConfigData.json`, so that dump is at another revision than the generated text. The three keys wait on a dump that matches it.
- The bag's weapon entries hold only a level (`InventoryItem.level`), so a fodder weapon's invested EXP cannot be read, and a held weapon taken from the bag has no ascension, EXP or refinement. The Enhance fodder picks and the bag-held weapon's Ascend and Refine wait on the bag's weapon entries carrying the weapon's state. The ores-only Enhance does not.
- The passive's name and rank descriptions wait on the game text publishing their text ids in a reader-language record (`genshin:text names` covers materials only), and on a formatter for the `{paramN:FORMAT}` placeholders the descriptions carry.

## Impact

The Genshin world's weapon services, now called by a screen, the new weapon screen beside the character screen, and the three action labels in the game text.
