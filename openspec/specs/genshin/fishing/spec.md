## Purpose

Fishing's points, stocks, fish and rods read from the game's tables onto the world, each stock drawn by the game's clock and refilled seventy-two hours after it is emptied, a lure's reaction read off a fish's ranges, and a reel's tension held in its zone until the fish is caught or the line breaks, with nothing yet cast or on a screen.

## Requirements

### Requirement: Fishing points stand where the official map marks them

The fishing points SHALL stand in each region where the official map marks them.

#### Scenario: Region's points are placed from the official map

- **GIVEN** a region's fishing points are published
- **WHEN** the world loads that region
- **THEN** each point stands at the place the official map marks for it

### Requirement: A pool draws its day or night stock by the game's clock

A fishing pool SHALL draw its day stock from six o'clock to eighteen o'clock and its night stock at other hours, on the game's clock, which runs eight hours ahead of UTC.

#### Scenario: Cast at midday draws the day stock

- **GIVEN** a pool has a day stock and a night stock
- **WHEN** a fish is drawn at twelve o'clock on the game's clock
- **THEN** the fish is drawn from the day stock

#### Scenario: Cast at night draws the night stock

- **GIVEN** a pool has a day stock and a night stock
- **WHEN** a fish is drawn at twenty-three o'clock on the game's clock
- **THEN** the fish is drawn from the night stock

#### Scenario: Stock held at every hour is drawn at any time

- **GIVEN** a pool's stock is held at every hour of the day
- **WHEN** a fish is drawn at any hour
- **THEN** the fish is drawn from that stock

### Requirement: An emptied stock refills seventy-two hours later

An emptied fishing stock SHALL be back in full seventy-two hours after it was emptied.

#### Scenario: Stock is full again after seventy-two hours

- **GIVEN** a stock was emptied
- **WHEN** seventy-two hours have passed
- **THEN** the stock is back in full

#### Scenario: Day and night stocks refill on their own emptying

- **GIVEN** the day stock was emptied at one time and the night stock at another
- **WHEN** each has been seventy-two hours since it was emptied
- **THEN** each is back in full on its own emptying

### Requirement: A draw picks a fish by its share of the stock's weight

A fishing stock SHALL pick each fish with a chance equal to its share of the stock's total weight, and a stock weighing nothing SHALL draw no fish.

#### Scenario: Heavier fish is drawn more often

- **GIVEN** a stock holds two fish of different weights
- **WHEN** a fish is drawn
- **THEN** the heavier fish is drawn with the larger share of the chances

#### Scenario: Stock weighing nothing draws no fish

- **GIVEN** a stock's total weight is zero
- **WHEN** a fish is drawn
- **THEN** no fish is drawn

### Requirement: A fish reacts to a lure by its ranges

A fish SHALL flee any lure within its flee range, and turn toward only the bait it takes within its attract range, ignoring every other lure.

#### Scenario: Fish within its flee range flees the lure

- **GIVEN** a lure lies within a fish's flee range
- **WHEN** the fish reacts
- **THEN** the fish flees whatever the bait

#### Scenario: Fish turns toward the bait it takes

- **GIVEN** a bait the fish takes lies within its attract range
- **WHEN** the fish reacts
- **THEN** the fish turns toward the bait

#### Scenario: Lure outside the ranges is ignored

- **GIVEN** a lure lies outside a fish's flee and attract ranges
- **WHEN** the fish reacts
- **THEN** the fish does not react to the lure

### Requirement: The reel's tension is held in the zone until the fish is caught or the line breaks

A reel's tension SHALL rise while the reel is held and fall while it is not, clamped to the line's range, and the fish SHALL be caught once its hit points reach none inside the zone.

#### Scenario: Fish caught inside the zone

- **GIVEN** a fish is on the line and the tension is in the zone
- **WHEN** the rod's attack wears the fish's hit points down to none
- **THEN** the fish is caught

#### Scenario: Line breaks after staying out of the zone too long

- **GIVEN** the tension is out of the zone
- **WHEN** the allowance runs out
- **THEN** the line breaks and the fish is lost

### Requirement: Fishing offers no cast, bite, bait or bag item yet

Fishing SHALL NOT yet offer casting, bites, bait, a fish's skills, a screen or a bag item to the player.

#### Scenario: Fishing point in reach offers no cast

- **GIVEN** the player stands in reach of a fishing point
- **WHEN** the player is in the world
- **THEN** no cast prompt or fishing screen is offered

### Requirement: A pool stock missing from the game's table is an error

A fishing pool SHALL NOT be built with a stock the game's table does not hold.

#### Scenario: Stock the table does not hold fails the build

- **GIVEN** a pool lists a stock the game's table does not hold
- **WHEN** the fishing data is built
- **THEN** the build fails rather than leaving that stock out of the pool
