## Purpose

The /resource-explorer/all List/Summary toggle — per-type count cards over a grouped count procedure.

## Requirements

### Requirement: The All list offers a Summary view

The All list SHALL offer a Summary view that replaces the table with one card per resource type.

#### Scenario: Owner switches to Summary

- **GIVEN** the owner is viewing the All list
- **WHEN** the owner chooses Summary
- **THEN** the table is replaced by one card per resource type

### Requirement: Each card shows a type's count under the current filters

Each card SHALL show the type's icon, its name and the number of resources of that type that match the current filters.

#### Scenario: Card count under a search

- **GIVEN** the owner has searched the All list
- **WHEN** the owner views the Summary
- **THEN** each card counts only the resources matching the search

### Requirement: A card's count equals the rows its list shows

A card's count SHALL equal the number of rows the list shows once that card's type is chosen.

#### Scenario: Card matches its list

- **GIVEN** a card shows a count of eleven surveys
- **WHEN** the owner clicks the card
- **THEN** the list shows eleven rows

### Requirement: The Summary ignores a type filter already set

The Summary SHALL NOT narrow its counts by a type filter the owner has already set.

#### Scenario: Type filter already set

- **GIVEN** the owner has filtered the list to surveys
- **WHEN** the owner switches to Summary
- **THEN** the cards still show every type that matches the other filters

### Requirement: Clicking a card opens the list filtered to its type

Clicking a card SHALL switch back to the list filtered to that card's type.

#### Scenario: Owner clicks a card

- **GIVEN** the Summary shows a card for dashboards
- **WHEN** the owner clicks it
- **THEN** the list opens showing only dashboards

### Requirement: The Summary shows only types with matching resources

The Summary SHALL show only the types that have resources matching the current filters.

#### Scenario: No resources match

- **GIVEN** no resources match the current filters
- **WHEN** the owner switches to Summary
- **THEN** an empty state is shown instead of cards

### Requirement: Cards are ordered by count, highest first

Cards SHALL be ordered by their count, with the largest first.

#### Scenario: Several types

- **GIVEN** the Summary shows surveys with two and dashboards with eleven
- **WHEN** the owner views the Summary
- **THEN** the dashboards card comes first

### Requirement: The List or Summary choice is not kept in the address

The List or Summary choice SHALL NOT be part of the page address, so a shared link opens the list.

#### Scenario: Sharing a Summary link

- **GIVEN** the owner is viewing the Summary
- **WHEN** the owner copies the page address and opens it elsewhere
- **THEN** the list is shown

### Requirement: Refresh re-reads the view on screen

Refresh SHALL re-read whichever view is showing, the list or the Summary.

#### Scenario: Refresh while the Summary is showing

- **GIVEN** the owner is viewing the Summary
- **WHEN** the owner chooses Refresh
- **THEN** the counts are read again

### Requirement: The Summary shows an error state with a retry

If the counts cannot be read, the Summary SHALL show an error state with a retry action.

#### Scenario: Counts fail to load

- **GIVEN** the counts cannot be read
- **WHEN** the owner views the Summary
- **THEN** an error state is shown with a retry action
