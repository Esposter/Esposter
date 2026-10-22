# Expeditions

## Why

The expeditions page holds the sending, the return, the claim, the recall and the limit by rank, with Mondstadt's places. A player still cannot meet any of it: no Katheryne talk opens the expedition screen, the other nations' places are not open, and a character's expedition talent or the level-based bonus chance does nothing. Expeditions are how characters are sent out for rewards, so this change finishes what a player meets.

## What Changes

Talking to Katheryne opens the expedition screen, and the places, bonus and talents apply to what a character is sent on.

- Talking to Katheryne opens the expedition screen, where a character, a place and one of its durations are chosen.
- A send is refused by the rules the expeditions page holds.
- Every character except the Traveler stays usable in the party while on expedition.
- A place opens once its named statue is resonated, and each other nation's places open as its statues are placed.
- A character's level sets the chance of an expedition bonus.
- A character's expedition talent shortens or adds to the expedition it is sent on.

## Capabilities

- **genshin/expeditions** (modified)

## Waiting on

- `openspec/changes/genshin-map-unlocking/`: the other nations' places open by their statues.
- `openspec/changes/genshin-character-kits/`: the expedition talents are read from the characters' kits.
- The residents' join, which places Katheryne in Mondstadt's region data before her talk is wired.

## Impact

The interface gains the expedition screen, and the world gains its screen, its places and Katheryne's talk. Each send, claim and recall goes through the expedition service. The bonus chance is read from the game's bonus table, and the bonus's payload is not yet settled.
