# Companionship

## Why

The Friendship Level, the EXP that raises it and the namecard a level 10 holds are built. What is still open is the Serenitea Pot dialogue that levels 4 and 7 open, and the Companionship EXP that commissions and random events give, which has no route into the friendship grant yet. Until those land, a companion in the pot never speaks at 4 or 7 and a commission's Companionship EXP is never granted.

## What Changes

Friendship levels 4 and 7 open dialogue with a companion in the Serenitea Pot, and commission claims grant their Companionship EXP.

- A companion in the Serenitea Pot opens its dialogue when its Friendship Level reaches 4 or 7.
- A dialogue that also waits on a quest stays closed until both are met.
- A commission claim's Companionship EXP is granted to the deployed characters through the friendship grant; a character at level 10 gains none.

## Capabilities

- **genshin/companionship** (modified)

## Waiting on

- `openspec/changes/genshin-serenitea-pot/`: the pot's companions, which the dialogue at 4 and 7 is said of.
- `openspec/changes/genshin-commissions/`: the commissions' routing step, which hands the claim's Companionship EXP to the grant.
- Random events, which have no page yet and so no Companionship EXP source.
- Game exports, which the dialogue and NPC tables are read from.

## Impact

- The Friendship Level in the Genshin world: the Serenitea Pot's companion dialogues, the friendship grant, and the Profile tab's opened levels.
