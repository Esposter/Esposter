# Gadgets

## Why

Gadgets are the game's tools: the Wind Catcher, the Treasure Compasses, the Oculus Resonance Stones and the Portable Waypoint among them. The gadgets page holds their kinds, data and cooldowns, but a player cannot yet carry one in the bag, equip it to Z, or use it, so the gadget tab is empty and Z does nothing.

## What Changes

Gadgets become bag items that a player equips and uses, with detectors that point to what their city spawns.

- Each gadget appears in the bag's gadget tab.
- A gadget the game marks equipable can be equipped to the quick-use slot from its tab.
- Pressing Z uses the equipped gadget when its cooldown is ready, and the HUD shows its cooldown.
- A Treasure Compass points to the nearest treasure box of its city, and a Seelie detector to the nearest Seelie crystal.
- Holding Z opens a quick swap of up to four gadgets chosen from the bag.

## Capabilities

- **genshin/gadgets** (modified)

## Waiting on

- `openspec/changes/genshin-spawned-places/`: the detectors point to what the world spawns.
- `openspec/changes/genshin-crafting/`: most gadgets are crafted at the bench.
- `openspec/changes/genshin-domains/`: the usable-here check for a gadget in a domain.
- Co-op, which is deferred: the check for a gadget in another player's world waits on it.
- A compass's city joins a region's chest slice only once its areas are outlined.
- The Oculus Resonance Stone's target, which the config does not hold; its detector is not settled until the target is read from another table.

## Impact

The bag gains the gadgets as widget material items, the quick-use slot and the HUD gain the equipped gadget and its cooldown, and the input binding for Z takes the quick swap's hold. The detectors read the spawned places, and the config's gadget kinds read from the game's data. The gadget's effect where its kind leaves it open is measured from a recording.
