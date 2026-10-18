# Elemental Nodes and Infusion Stones

## Why

Elemental Nodes and Infusion Stones are the world's own elements: a node pulses its element into the enemies near it, and a stone holds an element over the ground around it. Neither exists in the world yet, so a fight beside one gets no element, and nothing in the puzzles or the combat rules can rely on one.

## What Changes

Enemies in reach of a node take its element on a fixed clock, and the buff that pulse leaves lasts until a reaction spends it.

- A node pulses once every fifteen seconds, and each pulse lays its element on the enemies it reaches.
- An unbuffed enemy gains the node's full gauge. A buffed enemy gains a further 1.2 gauge, up to 3.6.
- A buffed enemy resists more to every element and to physical hits, and more again to the node's own element, for as long as the buff's gauge lasts.
- A reaction that spends the buff ends it, and the enemy cannot regain it for the next two pulses.

The duration is the gauge, not a timer, because the wiki says the buff does not decay and ends only when reactions deplete it.

Placing the nodes and stones in the world, and destroying a stone, wait on data this build does not hold, so they are not built here (see the design's Notes).

## Capabilities

- **genshin/elemental-nodes** (new)

## Waiting on

- The node and stone placements, which the scene groups this build holds do not carry, and whose group scripts are read from the PC export: `openspec/changes/genshin-puzzles/`.

## Impact

Adds the node's model and four pure services under `packages/genshin-world/src/services/elementalNode/`, and one enemy field the services read. Nothing in the world calls them yet.
