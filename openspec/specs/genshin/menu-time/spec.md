# genshin/menu-time Specification

## Purpose

The Time screen the Paimon menu's side bar opens, as the world plays it: its dial sets how far the world's clock advances, bounded to thirty minutes through two days and never back, and Confirm sets the clock to the target hour, while closing without confirming leaves the clock as it was. Its Confirm pill, title and close cross are pointer controls the controller capture does not show, so they are input-mode deviations, drawn and left out of the reference's score.

## Requirements

### Requirement: Time advance is bounded to thirty minutes through two days

The Time screen SHALL set an advance of at least thirty minutes and at most two days ahead of the current hour, and SHALL never set one backward.

#### Scenario: An advance under thirty minutes lands thirty minutes on

- **GIVEN** the Time screen is open at the current hour
- **WHEN** the player dials an advance of ten minutes and confirms
- **THEN** the clock lands thirty minutes ahead

#### Scenario: An advance beyond two days stops at two days

- **GIVEN** the Time screen is open at the current hour
- **WHEN** the player dials an advance of three thousand minutes and confirms
- **THEN** the clock lands two days ahead

#### Scenario: An advance past midnight wraps onto the next day's hours

- **GIVEN** the current hour is late in the evening
- **WHEN** the player confirms an advance that passes midnight
- **THEN** the clock shows the hour after midnight of the next day

### Requirement: Confirm sets the world's clock to the target

The Time screen SHALL set the world's clock to the dialled target only when the player confirms, and the world SHALL run on from that hour.

#### Scenario: Confirm sets the clock to the target

- **GIVEN** the player has dialled an advance on the Time screen
- **WHEN** the player confirms
- **THEN** the world's clock shows the target
- **AND** the screen closes back to the world

#### Scenario: Closing without confirming leaves the clock as it was

- **GIVEN** the player has dialled an advance on the Time screen
- **WHEN** the player closes the Time screen without confirming
- **THEN** the world's clock keeps its hour

### Requirement: The dial counts whole turns as days

The Time dial SHALL add one day to the advance for each whole turn the pointer makes around it.

#### Scenario: A full turn of the dial adds a day

- **GIVEN** the Time screen is open at the current hour
- **WHEN** the player drags the pointer once fully round the dial
- **THEN** the advance grows by one day

### Requirement: The hour is labelled with the day it falls on

The Time screen SHALL label the hour the dial points at with the game's day word for the day that hour falls on: Today while it falls on the clock's own day, Tomorrow once it passes midnight, and Day After Tomorrow two days on.

#### Scenario: The day under the hour reads Today while the hour falls on the clock's day

- **GIVEN** the current hour is in the morning
- **WHEN** the dial points at an hour later that same day
- **THEN** the hour is labelled Today

#### Scenario: The hour past midnight is labelled Tomorrow

- **GIVEN** the current hour is late in the evening
- **WHEN** the dial points at the hour after midnight
- **THEN** the hour is labelled Tomorrow

#### Scenario: The hour two days on is labelled Day After Tomorrow

- **GIVEN** the Time screen is open at the current hour
- **WHEN** the player dials an advance of two days
- **THEN** the hour is labelled Day After Tomorrow
