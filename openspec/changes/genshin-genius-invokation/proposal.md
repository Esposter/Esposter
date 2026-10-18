# Genius Invokation TCG

## Why

The card game's rules engine and its decks are built, and the tutorial is playable, but the game beyond the tutorial is not. No duel is seated yet, most cards and skills have no module, and nothing pays the player's Player Level, the rewards or the Card Shop. The game is a board with no opponents to play, and the game's own progression (levels, rewards, Lucky Coins) does not run.

## What Changes

Finish Genius Invokation TCG beyond its tutorial: every card's effect, seated opponents with their decks, the Player Level and its games, the duels' rewards and the Card Shop.

- Each card and character skill plays its effect as the game's own card data gives it.
- Two challengers are seated at their estimated places and offer their duel from their talk, which opens the duel screen.
- Further opponents, invitational and tavern challengers, play the decks the game gives them.
- The player's Player Level follows the game's level table and rises with the EXP its duels pay.
- Each Player Level opens the challenger games its level unlocks.
- Winning a duel pays the opponent's cards and Lucky Coins, and the Card Shop sells cards for Lucky Coins.
- The card game opens at Adventure Rank 32 with its tutorial quest.
- Duels against other players are not part of this change.

## Capabilities

- **genshin/genius-invokation** (new)

## Waiting on

- The Player Level's slice is built and its dry run is clean. Its real publish, which adds the `gcg/levels` key to the lock, is the main session's. The tutorial's start waits on quest 70665 being carried, since the world has no finish event for it.
- The seated challengers wait on the talks system's split.
- The challengers' decks 12103, 13001, 14002, 12105 and 13003 carry no card list in the 7.1 dump, so their cards cannot be modelled yet.

## Impact

The card game's rules and its cards, each card's module and the decks it plays. The duel screen opened from a resident's talk. The Player Level, its games, the rewards and the Card Shop. The hosted game data the card game's tables are published into, and the talks of the two seated challengers.
