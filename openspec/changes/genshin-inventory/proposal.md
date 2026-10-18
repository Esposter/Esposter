# Inventory

## Why

The bag, its wallet, its screen and its destroy mode are built. What the bag still lacks is using a food: a food sits in the bag with no effect, so the party cannot be healed by the meals the game gives it.

## What Changes

Using a food takes one from the bag and applies its heal to its target, never past full health.

- Using a food takes one from the bag and heals the target the food names: the selected character for most recovery dishes, the whole party for some.
- A healing food never raises a character's health past full.
- Using a food with none in the bag is refused.
- The heal each food gives is read from the game's material table once the cooking proposal reads it.

## Capabilities

- **genshin/inventory** (modified)

## Waiting on

- The heal each food gives, read from the material table by the cooking proposal: `openspec/changes/genshin-cooking/`.

## Impact

The bag's screen in the open world, which gains using a food. The party's health, which using a food raises.
