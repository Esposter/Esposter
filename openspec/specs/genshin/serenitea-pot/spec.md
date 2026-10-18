## Purpose

The Serenitea Pot's rules from the game's tables — Tubby's furnishings made from blueprints in one queue per Trust Rank over real time, Trust EXP from each first making, the Adeptal Energy rank read off a realm's comfort, and Realm Currency and Realm Bounty accruing per real hour into stores capped by Trust Rank. The realm's scene, the placement editor and its load, the depot, gardens, ponds, the Adeptal Mirror and the companions' invitations are not built yet.

## Requirements

### Requirement: A furnishing is made only once its blueprint is open

A furnishing SHALL be started only when its blueprint is open, either from the start or by learning its diagram.

#### Scenario: A furnishing with an open blueprint can be started

- **GIVEN** a furnishing's blueprint is open
- **WHEN** the player starts it
- **THEN** it is started

#### Scenario: A furnishing with a closed blueprint is refused

- **GIVEN** a furnishing's blueprint is not open
- **WHEN** the player tries to start it
- **THEN** the start is refused

### Requirement: Tubby runs one furnishing per Trust Rank at a time

Tubby SHALL run one queue for each Trust Rank, and each queue SHALL hold one furnishing at a time, taking that furnishing's time in real time.

#### Scenario: A start is refused while every queue is busy

- **GIVEN** every queue holds a furnishing
- **WHEN** another furnishing is started
- **THEN** the start is refused

#### Scenario: A furnishing started in a free queue runs while the page is closed

- **GIVEN** a queue is free and the furnishing's materials are in the bag
- **WHEN** the furnishing is started and the page is then closed
- **THEN** the furnishing finishes in its queue while the page is closed

### Requirement: A furnishing needs its materials and takes them when it starts

A furnishing SHALL start only when its materials are in the bag, and SHALL take those materials from the bag at the moment it starts.

#### Scenario: Missing materials refuse the start

- **GIVEN** a furnishing's materials are not all in the bag
- **WHEN** the player starts it
- **THEN** the start is refused

#### Scenario: Materials are taken at the start

- **GIVEN** a furnishing's materials are all in the bag
- **WHEN** the furnishing is started
- **THEN** its materials are taken from the bag at once

### Requirement: A finished furnishing waits while the bag has no room

A finished furnishing SHALL wait in its queue while the bag has no room for it, and SHALL move into the bag once there is room.

#### Scenario: A finished furnishing waits for room in the bag

- **GIVEN** a furnishing is finished and the bag is full
- **WHEN** the player tries to collect it
- **THEN** it waits in its queue

#### Scenario: A finished furnishing enters the bag once there is room

- **GIVEN** a furnishing is waiting in its queue
- **WHEN** the bag has room for it
- **THEN** it moves into the bag

### Requirement: Trust EXP is gained once per blueprint from its first making

Trust EXP SHALL be gained when a furnishing is first collected into the bag, and only once for each blueprint.

#### Scenario: The first making of a blueprint gives Trust EXP

- **GIVEN** a blueprint has never been made
- **WHEN** its furnishing is collected into the bag
- **THEN** the blueprint's Trust EXP is gained

#### Scenario: A later making of the same blueprint gives no Trust EXP

- **GIVEN** a blueprint has already been made once
- **WHEN** its furnishing is collected again
- **THEN** no Trust EXP is gained

### Requirement: A Trust Rank is reached once every rank below it is held

A Trust Rank SHALL be reached once the EXP of every rank below it is held, and the last rank SHALL take no EXP.

#### Scenario: A rank is reached once the ranks below it are passed

- **GIVEN** the EXP of every rank below a rank is held
- **WHEN** the realm's Trust EXP is read
- **THEN** the realm is at that rank

#### Scenario: The last rank takes no EXP to reach

- **GIVEN** the realm is at the last Trust Rank
- **WHEN** Trust EXP is gained
- **THEN** the realm stays at the last rank

### Requirement: Adeptal Energy rank is read off the realm's comfort

The Adeptal Energy rank SHALL be the highest rank whose comfort the realm reaches, and no realm SHALL read below rank one.

#### Scenario: A realm reads as rank one at zero comfort

- **GIVEN** a realm has no comfort
- **WHEN** its Adeptal Energy rank is read
- **THEN** the rank is rank one

#### Scenario: A realm reads as the highest rank its comfort reaches

- **GIVEN** a realm's comfort reaches a rank's requirement
- **WHEN** its Adeptal Energy rank is read
- **THEN** the rank is that rank

### Requirement: Realm Currency and Realm Bounty accrue per real hour up to the store's limit

Realm Currency and Realm Bounty SHALL accrue per real hour at the Adeptal Energy rank in force, in whole units, and SHALL never pass the store limit of the Trust Rank.

#### Scenario: A store fills over real time

- **GIVEN** a store is below its limit
- **WHEN** a real hour passes at the Adeptal Energy rank in force
- **THEN** the store gains its whole-unit rate for that hour

#### Scenario: A store stops at its limit

- **GIVEN** a store is at its Trust Rank's limit
- **WHEN** more real time passes
- **THEN** the store does not grow past its limit

#### Scenario: A clock read earlier than the last claim produces nothing

- **GIVEN** a store was last claimed at a later time than the clock now reads
- **WHEN** the store is settled
- **THEN** nothing accrues

### Requirement: A Trust Rank holds as many companions as its rank allows

A Trust Rank SHALL hold as many companions as its rank allows, from one companion at rank one to eight companions at rank ten.

#### Scenario: A rank-ten realm holds eight companions

- **GIVEN** the realm is at Trust Rank ten
- **WHEN** its companion allowance is read
- **THEN** eight companions are allowed

#### Scenario: A rank-one realm holds one companion

- **GIVEN** the realm is at Trust Rank one
- **WHEN** its companion allowance is read
- **THEN** one companion is allowed
