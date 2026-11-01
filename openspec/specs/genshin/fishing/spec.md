## Purpose

Fishing's points, stocks, fish and rods read from the game's tables (`{data-root}/genshin-dump-backup-6.6/ExcelBinOutput/FishStockExcelConfigData.json`, `FishExcelConfigData.json`) onto the world, each stock drawn by the game's clock and each caught fish back in its stock seventy-two hours after it is caught, a lure's reaction read off a fish's ranges, and a reel's tension held in its zone until the fish is caught or the line breaks, with nothing yet cast or on a screen.

## Requirements

### Requirement: Fishing points stand at their fitted places

The fishing points SHALL stand in each region at their fitted places.

#### Scenario: Region's points are placed from the official map

- **GIVEN** a region's fishing points are published
- **WHEN** the world loads that region
- **THEN** each point stands at its fitted place

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

### Requirement: A caught fish returns to its stock seventy-two hours later

A caught fish SHALL return to the stock it was caught from seventy-two hours after the catch, so a stock refills fish by fish, and each stock's catches SHALL persist in the save until they return, so a reload neither refills nor empties a stock early.

#### Scenario: Caught fish is back seventy-two hours later

- **GIVEN** a fish was caught from a stock
- **WHEN** seventy-two hours have passed since the catch
- **THEN** the fish is back in the stock

#### Scenario: Stock refills one fish at a time

- **GIVEN** two fish were caught from a stock an hour apart
- **WHEN** seventy-two hours have passed since the first catch
- **THEN** one fish is back in the stock
- **AND** both are back once seventy-two hours have passed since the second catch

#### Scenario: Day and night stocks return fish on their own catches

- **GIVEN** a fish was caught from the day stock and another from the night stock at different times
- **WHEN** each has been seventy-two hours since its catch
- **THEN** each fish is back in its own stock on its own catch

#### Scenario: Catches persist across a reload

- **GIVEN** a fish was caught from a stock and has not yet come back
- **WHEN** the save is written and read back
- **THEN** the stock is still short of that fish
- **AND** the fish is back once seventy-two hours have passed since the catch

### Requirement: A draw picks a fish by its share of the stock's weight

A fishing stock SHALL pick each fish with a chance equal to its share of the stock's total weight, and a stock weighing nothing, or with no fish left, SHALL draw no fish.

#### Scenario: Heavier fish is drawn more often

- **GIVEN** a stock holds two fish of different weights
- **WHEN** a fish is drawn
- **THEN** the heavier fish is drawn with the larger share of the chances

#### Scenario: Stock weighing nothing draws no fish

- **GIVEN** a stock's total weight is zero
- **WHEN** a fish is drawn
- **THEN** no fish is drawn

#### Scenario: Stock with no fish left draws none

- **GIVEN** a stock's catches have left it with no fish
- **WHEN** a fish is drawn at a point in its region
- **THEN** the stock draws no fish

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

### Requirement: Fishing offers a cast, a bite, bait, a screen and the catch in the bag

Fishing SHALL offer the player a cast at a fishing point in reach while a stock of its region stands, with the bite, the bait, the screen and the caught fish put in the bag, and SHALL NOT yet give a fish its skills.

#### Scenario: Fishing point in reach offers a cast

- **GIVEN** the player stands in reach of a fishing point whose region has a stock standing
- **WHEN** the player is in the world
- **THEN** a cast row named by the game's fishing text is offered at the point

### Requirement: A pool stock with no record is an error

A fishing pool SHALL NOT be built with a stock that has no record.

#### Scenario: Stock with no record fails the build

- **GIVEN** a pool lists a stock that has no record
- **WHEN** the fishing data is built
- **THEN** the build fails rather than leaving that stock out of the pool

### Requirement: A spot's ripple shows only while a stock of its region still has fish

A fishing point SHALL be offered for a cast only while a stock of its region's pools stands at the hour with fish left, the ripple the wiki's Fishing page puts on the spot, which disappears once all its available fish are caught and returns once one respawns (`{data-root}/cache/genshin-wiki/Page_Fishing.json`, wikitext line 23).

#### Scenario: Points are withheld once every stock reads zero

- **GIVEN** every stock of a region's pools reads zero at the hour
- **WHEN** the world lists the points in reach
- **THEN** the region's points are not offered

#### Scenario: Points return seventy-two hours after the first catch

- **GIVEN** every stock of a region's pools reads zero at the hour, after a catch made at a moment
- **WHEN** seventy-two hours have passed since that catch
- **THEN** the region's points are offered again

## Open

The claims this spec leaves open, and the sources each waits on, are listed in the [design](design.md)'s Open section.
