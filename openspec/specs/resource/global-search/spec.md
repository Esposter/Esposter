## Purpose

Azure-portal-faithful resource-explorer search — the command palette's resources scope on the explorer home page, grouped as it is typed, opened from a field-shaped button on Home, keyboard chords, and prefix-match ranking. Search covers resources, services and pages in one palette, with the last row opening the full filtered list.

## Requirements

### Requirement: The explorer home search lists resources, services and pages as the owner types

The explorer home page SHALL search resources, services and pages as the owner types, in separate groups.

#### Scenario: Typing shows the three groups

- **GIVEN** the owner is on the Resource Explorer home page
- **WHEN** they type a query into the palette
- **THEN** matching resources, services and pages are listed in their own groups

#### Scenario: A service row offers Create

- **GIVEN** a query matches a service
- **WHEN** the owner looks at that service's row
- **THEN** a Create row is offered beneath it

#### Scenario: Picking a resource opens it

- **GIVEN** a resource is listed in the results
- **WHEN** the owner picks it
- **THEN** the resource page opens

#### Scenario: Picking a service opens its filtered list

- **GIVEN** a service is listed in the results
- **WHEN** the owner picks it
- **THEN** the full resource list opens filtered to that type

### Requirement: See all results opens the full list with the query

The palette SHALL end with a row that opens the full resource list filtered by the query.

#### Scenario: See all carries the query

- **GIVEN** the owner has typed a query
- **WHEN** they pick See all results
- **THEN** the full resource list opens with that query applied

#### Scenario: A query with no matches still offers See all

- **GIVEN** the query matches nothing
- **WHEN** the owner looks at the results
- **THEN** only the See all row is offered

### Requirement: An empty query shows recent searches and recently opened resources

The palette SHALL show the owner's recent searches and recently opened resources when the query is empty.

#### Scenario: Recent searches are listed on an empty query

- **GIVEN** the owner has searched for terms before
- **WHEN** the palette opens with an empty query
- **THEN** their recent searches are listed, up to five

#### Scenario: Recently opened resources are listed on an empty query

- **GIVEN** the owner has opened resources before
- **WHEN** the palette opens with an empty query
- **THEN** those resources are listed as Recently opened

#### Scenario: Recent searches stay on this device

- **GIVEN** the owner searched for a term on one device
- **WHEN** they open the palette on another device
- **THEN** that term is not among the recent searches

### Requirement: The Home search button opens the palette

The Home page SHALL show a search button drawn as a field, which opens the palette rather than carrying a search of its own.

#### Scenario: Clicking the Home search field opens the palette

- **GIVEN** the owner is on the Resource Explorer home page
- **WHEN** they click the search field
- **THEN** the palette opens with the resources scope

### Requirement: Keyboard chords reach resources, the full list and notifications

The explorer SHALL bind the search and navigation chords so that they do nothing while the owner is typing in a field.

#### Scenario: Ctrl+K opens resource search on the home page

- **GIVEN** the owner is on the Resource Explorer home page and not typing in a field
- **WHEN** they press Ctrl+K
- **THEN** the palette opens on resources

#### Scenario: G then A opens the full list

- **GIVEN** the owner is on the Resource Explorer home page and not typing in a field
- **WHEN** they press G then A
- **THEN** the full resource list opens

#### Scenario: G then N opens notifications

- **GIVEN** the owner is on the Resource Explorer home page and not typing in a field
- **WHEN** they press G then N
- **THEN** the notifications panel opens

#### Scenario: Chords do nothing while typing

- **GIVEN** the owner is typing in a text field
- **WHEN** they press G then A
- **THEN** no navigation happens

#### Scenario: The shortcuts dialog lists the chords

- **GIVEN** the owner is on the Resource Explorer home page
- **WHEN** they press Shift+?
- **THEN** the shortcuts dialog lists these chords

### Requirement: Picking a result remembers the query

The palette SHALL remember a query as a recent search when the owner picks a result from it.

#### Scenario: A picked result adds its query to recent searches

- **GIVEN** the owner searched for a term and picked a result
- **WHEN** they next open the palette with an empty query
- **THEN** that term is among their recent searches
