# Puzzles

## Why

Puzzles are much of the game's exploration, and each opens a door, raises a platform or spawns a chest. The as-built page holds the puzzle places and three state machines (the monument, the Seelie and the Time Trial Challenge), but no mechanism is drawn, struck or solved in the world yet, so nothing can be solved.

## What Changes

Puzzles are placed, drawn and solved in the world, starting with Mondstadt's Seelies and Elemental Monuments.

- Each of Mondstadt's thirty Seelie courts is paired with one Seelie, closest pairs first, and a followed Seelie is led home and spawns its chest when it settles.
- Elemental Monuments in Mondstadt light when struck by their element, a reaction's included, and timed ones go out; a group lit together solves its puzzle.
- Time Trial Challenges spawn their chest only when every target is done before the timer ends.
- Shrines of Depths open with a key from their own region, each holding a Luxurious chest.
- A solved puzzle stays solved unless the game resets it.

Constants the map and the wiki leave open, such as a monument's time lit and a Seelie's route, stay provisional until recordings measure them.

## Capabilities

- **genshin/puzzles** (new)

## Waiting on

- The spawned places, where the mechanisms stand: `openspec/changes/genshin-spawned-places/`.
- The character kits, whose attacks strike the mechanisms: `openspec/changes/genshin-character-kits/`.
- The chests, which a solved mechanism unlocks or spawns: `openspec/changes/genshin-chests/`.
- The Statues of The Seven, which give the Shrine of Depths keys: `openspec/changes/genshin-statues-of-the-seven/`.

## Impact

The puzzle places in Mondstadt, the Seelies and their courts, the monuments struck by character attacks, Time Trial markers, Shrines of Depths and their keys, and the chests they open.
