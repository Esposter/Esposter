# Forging

## Why

The forging page holds the recipes, queues, orders, daily cap and forging talents, and every number the rules need is read. A player still cannot forge: no blacksmith stands in a city, and the forge screen is not wired to the forge state, so its queues and orders have nothing to show.

## What Changes

A city's blacksmith stands at its forge place, and the forge screen lists its recipes and queues and takes each finished order.

- Each city's blacksmith stands at the forge place its scene group record gives.
- The forge screen lists each recipe and each queue from the forge state.
- Obtaining a finished order gives its item and Adventure EXP at the player's Adventure Rank.
- The screen labels its actions in the game's own words, and an order the daily cap refuses shows the game's refusal words.

## Capabilities

- **genshin/forging** (modified)

## Waiting on

- `openspec/changes/genshin-recreation-passes/`: the forge screen's layout is measured through the recreation passes.
- The owed recording `forge-order-queue.mkv`, which measures the screen's layout. Until it lands the public clip of the Wagner forge is the layout's reference.

## Impact

The world gains the blacksmith's place and the forge screen's container, which binds the forge state and the order's obtain. The interface's forge screen takes its two tabs and its queues from the state it is given. The words come from the game's text by their ids, and no number the forging rules set changes.
