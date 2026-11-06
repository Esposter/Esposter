# Shortcut Wheel customization

Customizing the Shortcut Wheel's entries and its direction count from Settings, from Adventure Rank 20. The wheel ships with the wiki's default entries, eight in the 8-direction layout and four in the 4-direction one, as the [shortcut wheel change](../../../changes/genshin-shortcut-wheel/design.md) builds them.

**Why deferred:** the wheel is drawn, but its layout is provisional until the parity trace of the game's own wheel replaces the drawing ([the change's task 3.1](../../../changes/genshin-shortcut-wheel/tasks.md)). Customization is built on the layout that trace settles, not on a drawing the trace will replace.

**Revisit when:** task 3.1 of the [shortcut wheel change](../../../changes/genshin-shortcut-wheel/tasks.md), the trace of the game's own wheel, is ticked. Customization then opens its own change.

**Costs:** a field on the save for the chosen entries and direction count, which stored saves need backfilled because they predate it, and a Settings control for the direction count, gated on Adventure Rank 20.
