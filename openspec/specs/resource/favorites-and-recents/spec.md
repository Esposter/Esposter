## Purpose

Server-side stars and server-side opens — the two "take me back to what I was working on" sets, rendered as Home tabs and as full list routes. The sets follow the owner across devices and skip any resource in the recycle bin without losing the star.

## Requirements

### Requirement: The owner can star a resource and see the starred set

The owner SHALL be able to star and unstar a resource, and SHALL see every starred resource in a Favorites view ordered by when it was starred, newest first.

#### Scenario: Starring a resource adds it to Favorites

- **GIVEN** the owner has a resource that is not starred
- **WHEN** they star it
- **THEN** it appears in Favorites

#### Scenario: Unstarring removes it from Favorites

- **GIVEN** a starred resource
- **WHEN** the owner unstars it
- **THEN** it no longer appears in Favorites

#### Scenario: The most recently starred resource is listed first

- **GIVEN** the owner starred two resources in turn
- **WHEN** they open Favorites
- **THEN** the later-starred resource is listed first

### Requirement: A star reflects the server's answer

The star SHALL show the state the server reports after a toggle, so a stale view corrects itself.

#### Scenario: A star changed in another tab shows the right state

- **GIVEN** the owner has a list open and stars a resource in another tab
- **WHEN** they toggle that resource's star in this list
- **THEN** the star shows the state the server reports

### Requirement: Opening a resource records it as recent

The system SHALL record that the owner opened a resource, and SHALL list recently opened resources most recently opened first.

#### Scenario: Opening a resource moves it to the top of Recent

- **GIVEN** the owner opened resource A and then resource B
- **WHEN** they open Recent
- **THEN** resource B is listed first and resource A second

#### Scenario: Autosave does not count as opening

- **GIVEN** the owner has a resource open and it autosaves
- **WHEN** they open Recent
- **THEN** the resource's place in Recent is unchanged by the save

#### Scenario: A failed record does not fail the visit

- **GIVEN** recording a visit fails
- **WHEN** the owner opens the resource
- **THEN** the resource opens normally
- **AND** no error is shown

### Requirement: Recent and Favorites appear on Home and as full lists

The explorer SHALL show Favorites and Recent as tabs on Home and as full lists that can be filtered, sorted and acted on.

#### Scenario: A Home tab shows the first few entries

- **GIVEN** the owner has starred or opened resources
- **WHEN** they look at the Home tabs
- **THEN** Favorites and Recent show their entries

#### Scenario: The full list supports filters and sorting

- **GIVEN** the owner opens the full Recent list
- **WHEN** they sort or filter it
- **THEN** the list is sorted or filtered accordingly

#### Scenario: A list shows when each resource was last opened

- **GIVEN** the owner views the full resource list
- **WHEN** they look at the Last accessed column
- **THEN** each resource shows when the owner last opened it

### Requirement: Starred and recent lists hide resources in the recycle bin

The explorer SHALL omit resources in the recycle bin from Favorites and Recent, and SHALL bring them back unchanged when they are restored.

#### Scenario: A deleted starred resource disappears from Favorites

- **GIVEN** a starred resource is moved to the recycle bin
- **WHEN** the owner opens Favorites
- **THEN** the resource is not listed

#### Scenario: Restoring brings the star back

- **GIVEN** a starred resource was moved to the recycle bin
- **WHEN** the owner restores it
- **THEN** it is starred again and listed in Favorites

### Requirement: The palette lists recently opened resources in the same order

The search palette SHALL list recently opened resources in the same order as the Recent view.

#### Scenario: The palette and Recent agree

- **GIVEN** the owner opened resources in a given order
- **WHEN** they open the search palette and then the Recent view
- **THEN** both list the resources in the same order

### Requirement: Recent searches stay on the device

The search palette SHALL keep recent search text on the device it was typed on and SHALL NOT sync it to other devices.

#### Scenario: A search typed on one device is not on another

- **GIVEN** the owner searched for a term on one device
- **WHEN** they open the palette on another device
- **THEN** that search term is not listed as recent
