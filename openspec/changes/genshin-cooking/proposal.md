# Cooking

## Why

The built cooking rules cover hand cooking, Auto Cook, specialties, processing and campfires, but nothing cooks in the world yet. No city has a stove, no cooking screen opens, a dish cannot be eaten for its effect, and the passives and cooking talents that bonus or double a dish are not wired. Food is how a party heals, revives and fights stronger, so these pieces finish cooking as a player meets it.

## What Changes

Add the city stove, the cooking screen, what an eaten dish does, the passives that bonus a kind of dish and the cooking talents that double or add dishes.

- A city's stove cooks whenever it is used, where a campfire cooks only while lit.
- The cooking screen opens at a stove and drives hand cooking and Auto Cook, with its indicator's zones provisional until measured.
- Eating a dish applies its heal, revive or bonus.
- A passive bonuses each dish of its food type, and a cooking talent adds a dish by chance.

## Capabilities

- **genshin/cooking** (modified)

## Waiting on

- `openspec/changes/genshin-inventory/`: eating a dish goes through its using of food, which that change builds first.
- `openspec/changes/genshin-character-kits/`: a dish's bonus is applied through the character kits' shared effects.

## Impact

The world's cooking services and models gain the stove, the talents and the passives. The interface gains a cooking screen, and the world's screen list gains it. The recipe and material tables are read for each recipe's food type and each dish's use, and the scene group record supplies the stove's place. Eating goes through the inventory's using.

Size kept as the source page's own: splitting it is a later decision.
