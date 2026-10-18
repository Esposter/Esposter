# Achievements

## Why

The achievements table, the quest triggers, the Achievements screen and the namecard a finished category pays are built. Most triggers still record nothing, because the pages that record their doings are not built yet. Each trigger type is wired once to the record it reads, so an achievement waits on the page that records its doing and moves once that page does. Until then its progress stays at zero, and a finished category's namecard is never granted to the profile.

## What Changes

Achievements for exploring, server-fired triggers and the namecard grant start counting as the pages that record their doings land.

- An exploring trigger (chests, waypoints, areas, statues and offerings, materials, fish caught) counts a doing once its page's rule is called from the world; until then its achievements stay at zero.
- Each server-fired achievement is counted by its own check, written when the page building its subject lands.
- A finished category's namecard is added to the profile's held namecards, read from the progress each time and never stored.
- Quest triggers count a named sub-quest, a parent-quest trigger counts when its main quest finishes, and an OR trigger counts each named quest once.

## Capabilities

- **genshin/achievements** (modified)

## Waiting on

- The waypoint and area triggers, which wait on the statues of the seven's scene points and areas for every region (region data holds Windrise only).
- The chest triggers, which wait on the chests unit calling `openChest` in the world.
- The offering levels, which wait on the offering systems unit.
- The server-fired achievements, which wait on the pages that build their subjects.

## Impact

- The Genshin world's achievement counting, the quest advance that hands it doings, and the profile's namecards.
- The Achievements screen's counts once the triggers record.
