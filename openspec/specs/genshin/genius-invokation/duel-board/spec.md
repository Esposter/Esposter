## Purpose

How a resident's talk opens a duel, the board's choices and the session that plays each one through the engine, then the opponent's turns. No duel is seated yet, since no challenger with a built deck stands in a built region's residents, so the board is reviewed through its parity fixture until one does.

## Requirements

### Requirement: A seated resident offers the duel on the talk's opening line

A resident with a seated duel SHALL offer the duel as a reply on the opening line of their standing talk, after the talk's own replies.

#### Scenario: Duel reply is offered after the talk's own replies

- **GIVEN** a resident has a seated duel
- **WHEN** the player begins the resident's talk
- **THEN** the duel reply is offered on the opening line after the talk's own replies

#### Scenario: Choosing the duel opens the board

- **GIVEN** the duel reply is offered
- **WHEN** the player chooses it
- **THEN** the talk ends and the duel board opens

#### Scenario: Resident with no seated duel offers none

- **GIVEN** a resident has no seated duel
- **WHEN** the player begins the resident's talk
- **THEN** no duel reply is offered

### Requirement: A quest's talk replaces a standing talk with the same id

A quest's talk SHALL take the place of a standing talk with the same id.

#### Scenario: Quest talk wins over the standing talk

- **GIVEN** a quest and a standing talk share an id
- **WHEN** the talks are merged
- **THEN** the quest's talk is the one used

### Requirement: The board holds only the choices the player makes

The duel board SHALL hold only the dice, card, tuning and switch or prepare choices the player is making, and SHALL send every other choice to the duel session.

#### Scenario: Board clears its choice whether or not the engine takes it

- **GIVEN** the player has made a choice on the board
- **WHEN** the engine takes it or refuses it
- **THEN** the board clears its choice

### Requirement: The opponent's turns are played by the scripted policy

After each player choice the opponent's turns SHALL be played by the scripted policy until the duel waits on the player.

#### Scenario: Opponent takes its first card then its first skill

- **GIVEN** the opponent has a card and a skill available on its turn
- **WHEN** the opponent takes its turn
- **THEN** it plays its first card, then uses its first skill, then declares the round's end

#### Scenario: Duel waits on the player after the opponent's turns

- **GIVEN** the opponent has finished its turns
- **WHEN** it is the player's turn
- **THEN** the duel waits for the player's choice

### Requirement: A duel is seated only from a challenger with a built deck

A duel SHALL be seated only from a challenger whose game is published, and no duel SHALL be seated while no challenger with a built deck stands in a built region's residents.

#### Scenario: No duel is seated yet

- **GIVEN** no challenger with a built deck stands in a built region's residents
- **WHEN** the player talks to the residents
- **THEN** no duel reply is offered by any resident

#### Scenario: Game whose opponent deck is missing fails the run

- **GIVEN** a seated game's opponent deck is not published
- **WHEN** the games are published
- **THEN** the run fails

#### Scenario: Game whose player deck is missing plays the placeholder deck

- **GIVEN** a seated game's player deck is not published
- **WHEN** the duel is opened
- **THEN** the placeholder deck is played as the player's deck

### Requirement: A duel's end returns the player to the world

A duel's end SHALL return the player from the board to the world.

#### Scenario: Leaving the board returns to the world

- **GIVEN** the duel board is open
- **WHEN** the player leaves the board
- **THEN** the player returns to the world
