## ADDED Requirements

### Requirement: The realm opens from the Serenitea Pot at Adventure Rank 28

The Serenitea Pot SHALL enter the player's realm only once the player has reached Adventure Rank 28.

#### Scenario: The pot opens the realm at Adventure Rank 28

- **GIVEN** a player at Adventure Rank 28 standing on a valid surface with the Serenitea Pot
- **WHEN** the player places the pot and interacts with it
- **THEN** the world fades into the player's realm

#### Scenario: The pot does not open the realm below Adventure Rank 28

- **GIVEN** a player at Adventure Rank 27 with the Serenitea Pot
- **WHEN** the player places the pot and interacts with it
- **THEN** the realm does not open

### Requirement: Leaving the realm returns the player to where they went in

The realm SHALL be left by the Serenitea Pot gadget or by any teleport in the open world, and each exit SHALL return the player to the place they entered the realm from.

#### Scenario: The gadget leaves the realm where the player went in

- **GIVEN** a player inside the realm who entered it from an open-world place
- **WHEN** the player uses the gadget to leave
- **THEN** the world fades back to that open-world place

#### Scenario: A teleport leaves the realm

- **GIVEN** a player inside the realm
- **WHEN** the player teleports in the open world
- **THEN** the realm is left and the player arrives back at the open-world place they entered the realm from

#### Scenario: A pot placed on an invalid surface is not placed

- **GIVEN** a player holding the Serenitea Pot
- **WHEN** the player tries to place the pot on a surface that is not valid
- **THEN** the pot is not placed

### Requirement: The placement editor refuses a furnishing that takes its area past the load

The furnishing placement mode SHALL refuse a placement that would take its area past the load the area holds.

#### Scenario: A placement within the area's load is kept

- **GIVEN** an area with room under its load
- **WHEN** the player places a furnishing in it
- **THEN** the furnishing is placed and the load shows green or orange

#### Scenario: A placement past the area's load is refused

- **GIVEN** an area whose load is one placement short of its limit
- **WHEN** the player places a furnishing that would exceed the limit
- **THEN** the furnishing is not placed
- **AND** the load shows red

### Requirement: A realm's placements are kept with the player's progress

The realm SHALL keep each furnishing placement with the player's progress, so that a return to the realm shows them where they were placed.

#### Scenario: Placements are kept across a return to the realm

- **GIVEN** a player who placed furnishings in the realm and left it
- **WHEN** the player returns to the realm
- **THEN** each furnishing is where it was placed

### Requirement: A companion is invited within the Trust Rank's count

The realm SHALL take as its companions characters other than the Traveler that the player owns, no more than the count the player's Trust Rank allows, and a companion the player dismisses SHALL leave the realm.

#### Scenario: A companion is invited within the Trust Rank's count

- **GIVEN** a Trust Rank one realm with no companions
- **WHEN** the player invites an owned character
- **THEN** the character lives in the realm

#### Scenario: A second companion is refused at Trust Rank one

- **GIVEN** a Trust Rank one realm with one companion
- **WHEN** the player invites a second character
- **THEN** the invitation is refused and the realm keeps one companion

#### Scenario: The Traveler cannot be invited

- **GIVEN** a realm with room for a companion
- **WHEN** the player invites the Traveler
- **THEN** the invitation is refused

#### Scenario: A character already living in the realm cannot be invited again

- **GIVEN** a realm in which a character already lives
- **WHEN** the player invites the same character again
- **THEN** the invitation is refused

#### Scenario: A character the player does not own cannot be invited

- **GIVEN** a realm with room for a companion
- **WHEN** the player invites a character they do not own
- **THEN** the invitation is refused

#### Scenario: A dismissed companion leaves the realm

- **GIVEN** a realm with a companion living in it
- **WHEN** the player dismisses the companion
- **THEN** the character no longer lives in the realm

### Requirement: A companion invited to a favoured gift set gives its reward once

A companion invited to a gift set it favours SHALL speak its dialogue for that set and give its one-time rewards.

#### Scenario: A favoured gift set gives the companion's reward once

- **GIVEN** a companion living in the realm that favours a furnishing set
- **WHEN** the player invites the companion to that gift set
- **THEN** the companion speaks its dialogue for the set
- **AND** the companion's one-time reward is given
- **AND** the reward is not given again when the set is offered once more

### Requirement: The Realm Depot sells its goods for Realm Currency

The Realm Depot SHALL offer its goods priced in Realm Currency, and the wallet SHALL hold Realm Currency.

#### Scenario: Realm Currency is held in the wallet

- **GIVEN** a player who has reached the realm
- **WHEN** the player opens the wallet
- **THEN** Realm Currency is listed in it

#### Scenario: Buying a furnishing from the depot takes Realm Currency

- **GIVEN** a player holding enough Realm Currency
- **WHEN** the player buys a furnishing from the depot's Furnishings tab
- **THEN** the price is taken in Realm Currency
- **AND** the furnishing is given

#### Scenario: A purchase the wallet cannot cover is refused

- **GIVEN** a player holding less Realm Currency than a good's price
- **WHEN** the player buys the good
- **THEN** the purchase is refused and the wallet is unchanged

#### Scenario: A weekly good's limit returns at its weekly refresh

- **GIVEN** a weekly good the player bought up to its limit
- **WHEN** the weekly refresh comes round
- **THEN** the player can buy the good again

### Requirement: A garden's fields and a pond yield over real time

A garden's fields SHALL grow their seeds, and a pond SHALL hold its fish, as real time passes in the realm.

#### Scenario: A garden's seeds grow over real time

- **GIVEN** a garden in the realm with seeds planted in its fields
- **WHEN** real time passes
- **THEN** the seeds grow into crops

### Requirement: A companion living in the realm earns Companionship EXP from the realm's Realm Bounty

A companion living in the realm SHALL earn Companionship EXP when the realm's Realm Bounty is claimed, the whole of the bounty its store holds to each companion.

#### Scenario: A companion living in the realm earns Companionship EXP

- **GIVEN** a companion living in the realm and a Realm Bounty store holding some bounty
- **WHEN** the player claims the store
- **THEN** the companion's Companionship EXP rises by the bounty the store held
- **AND** every companion living in the realm gains the whole of it, not a share
