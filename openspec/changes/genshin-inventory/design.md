# Inventory

The [inventory](../../specs/genshin/inventory/design.md) page holds the bag, its wallet, screen and destroy mode. What is left is using a food, and where an item a source names with no material type lives.

## Decisions

- **Food heals its own target.** Using a food takes one from the bag and applies its own effect to the target it names, never past full health. Each food's heal and target are read from the game's material table into `cooking/dishes`, and the bag applies them. A food the game uses on the party heals every member of it, and a single-target food heals the character on the field, provisional until the game's target picker is built. The 7.1 table names the selected character for every heal dish, so the party branch heals no dish yet.
- **An item with no material type is open.** `buildItems` leaves out an item the material table gives no type, since the dump leaves out `MATERIAL_NONE` and the world holds no member for it. A drop family, an expedition, a recipe, an offering or a Reputation reward can still name such an item, and `getItemDefinition` throws on an id missing from the materials map, so picking it up or taking it into the bag fails at runtime instead of at publish. Either the publish fails for an item a source names, or the world gains a place for it in the bag. The choice waits on the live dump, which shows which named items carry no type.

## Scope and order

**This adds:**

1. **Using food**, on each food's own target, with the party's health.

## What this does not propose

- **Topping up.** No payment of any kind.
- **The screen's look.** Its sizes, colours and the tabs' and items' icons are measured and traced in the [recreation passes](../genshin-recreation-passes/design.md).

## Key files

| File                                                               | Role after the change                         |
| :----------------------------------------------------------------- | :-------------------------------------------- |
| `packages/genshin-world/src/components/Inventory/Screen/Index.vue` | Gains using a food                            |
| `packages/genshin-world/src/services/party/`                       | The party's health, which using a food raises |

## Sources

- [Inventory](https://genshin-impact.fandom.com/wiki/Inventory), Genshin Impact Wiki: what each tab can use or destroy.

## Reference

- `bag-open-close.mkv` — the bag opened with B from the world and closed with B again, its weapons tab open, the English client at 1080p and 60 frames a second. The account tour's clip (`yt-_agTJviXj7s`) shows the bag's tabs at rest, and its open and close were not checked frame by frame. On the wiki and YouTube, none found (searched 2026-10-11).
- `bag-tabs.mkv` — the nine tabs clicked in their order, a second held on each, the hover and press of each shown. On the wiki and YouTube, none found (searched 2026-10-11).
- `bag-sort.mkv` — the sort switched from Quality to Level and back, the order arrow pressed both ways, the list reordering as it goes. On the wiki and YouTube, none found (searched 2026-10-11).
- `bag-scroll.mkv` — the weapons' grid scrolled from its first row to its last with the wheel, then back to the top. On the wiki and YouTube, none found (searched 2026-10-11).
- `bag-select.mkv` — three entries clicked in turn, the detail panel's change in view with each. On the wiki and YouTube, none found (searched 2026-10-11).
- `bag-sort-open.png` — the weapons tab's sort dropdown opened on Quality at 1080 high, its list in view, the English PC client, no other screen. The published frames show it closed only, so the list's look and its open motion wait on this still. On the wiki and YouTube, none found (searched 2026-10-11).
