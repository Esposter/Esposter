# Inventory

The [inventory](../../specs/genshin/inventory/design.md) page holds the bag, its wallet, screen and destroy mode. What is left is using a food.

## Decisions

- **Food heals its own target.** Using a food takes one from the bag and applies its own effect to the target it names, the selected character for most recovery dishes and the whole party for some, never past full health. It waits on each food's heal and target, which are the game's own figures and not yet read into the bag's data.

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
