## Purpose

Capped welcome-back production awarded for the time elapsed since the save was last stamped.

## Requirements

### Requirement: Time away is awarded at half the active rate

The clicker SHALL award points for time the player was away when a saved game loads, at half the rate of active production.

#### Scenario: Absence earns half of active production

- **GIVEN** a save last played two hours ago
- **WHEN** the save loads
- **THEN** the points awarded equal half of what current production would earn in those two hours

### Requirement: Time away counts for at most one day

The clicker SHALL count at most one day of time away when awarding offline progress.

#### Scenario: Long absence is capped at one day

- **GIVEN** a save last played three days ago
- **WHEN** the save loads
- **THEN** the points awarded equal half of what current production would earn in one day

### Requirement: Welcome-back dialog shows only for absences of a minute or more

The clicker SHALL award points for every absence and SHALL show the welcome-back dialog only when the absence lasted at least one minute.

#### Scenario: Short absence awards silently

- **GIVEN** a save last played thirty seconds ago
- **WHEN** the save loads
- **THEN** the points are awarded
- **AND** no welcome-back dialog is shown

#### Scenario: Longer absence shows the welcome-back summary

- **GIVEN** a save last played five minutes ago
- **WHEN** the save loads
- **THEN** the points are awarded
- **AND** the welcome-back dialog summarises the award

### Requirement: An award is saved at once so it is not repeated

The clicker SHALL save the awarded game as soon as the award is made, so that reloading the page does not award the same absence again.

#### Scenario: Reloading straight after an award does not award again

- **GIVEN** a player who has just received a welcome-back award
- **WHEN** the page is reloaded straight away
- **THEN** no second award is made for the same absence

### Requirement: No award for a save stamped in the future

The clicker SHALL make no offline award when the saved time is not earlier than the current time.

#### Scenario: Future save stamp awards nothing

- **GIVEN** a save whose last-played time is later than the current time
- **WHEN** the save loads
- **THEN** no points are awarded for time away

### Requirement: Offline points count toward each building's production

The clicker SHALL add each building's share of an offline award to that building's lifetime production.

#### Scenario: Award appears in building statistics

- **GIVEN** a player who receives an offline award with bought buildings
- **WHEN** the building statistics are viewed
- **THEN** each bought building's lifetime production includes its share of the award
