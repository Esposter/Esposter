## 1. The Player Level and its games

- [x] 1.1 Write the Player Level slice from the game's level table and read it with its schemas. Verify: a test named after the scenario "The Player Level follows the game's level table", written first and seen failing.
- [ ] 1.2 Publish the Player Level slice through the hosted game data, dry run first. Dry run done (`gcg/levels` added, nothing else moved); the real publish is the main session's, and the tutorial's start is blocked on quest 70665 not being carried. Verify: the publish step's dry run lists the Player Level slice with no write, and a test named after the scenario "Finishing the tutorial quest starts the Player Level at one" passes.

## 2. Seating the challengers

- [ ] 2.1 Seat Marjorie and Ellin at their estimated seats once the region holding their residents is written. Verify: a test named after the scenario "A seated challenger's talk opens the duel", written first and seen failing.
- [x] 2.2 Offer each challenger's games by the Player Level. Verify: tests named after the scenarios "A game opens once the Player Level reaches its level" and "A game above the Player Level is not offered".

## 3. The other opponents' decks

- [ ] 3.1 Model the cards and skills each further deck needs and publish each deck as its own record read by key. Verify: a test named after the scenario "A played card applies its effect", and the card's cost refusal named after "A card the player cannot pay for is refused". Blocked: decks 12103, 13001, 14002, 12105 and 13003 carry no card list in the dump, so no card of them can be modelled or published. The refusal test is written; "A played card applies its effect" is already covered by the tutorial-card tests.

## 4. Invitationals, tavern challengers and the Card Shop

- [ ] 4.1 Add the invitational and tavern challengers' duels, their rewards and the EXP they pay into the Player Level. Verify: tests named after the scenarios "A won duel pays cards, Lucky Coins and EXP" and "Passing a level's EXP raises the Player Level". Built so far: decks 11105 and 12005 as records and duels (games 1011, 1012 and 1083), with 12005's created cards modelled. The rewards, the EXP and the other 36 decks are not built.
- [x] 4.2 Add the Card Shop's sales in Lucky Coins. Verify: tests named after the scenarios "A card is bought with Lucky Coins" and "A card the player cannot afford is not sold". A bought card goes into the bag: no collection state exists yet.
- [ ] 4.3 Open the card game at Adventure Rank 32 with its tutorial quest. Verify: tests named after the scenarios "Reaching Adventure Rank 32 opens the card game" and "Below Adventure Rank 32 the card game stays closed".
