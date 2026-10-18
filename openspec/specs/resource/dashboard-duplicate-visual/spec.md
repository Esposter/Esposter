## Purpose

Duplicate on a dashboard tile's corner copies the visual — its type, chart settings and binding — under the original, so a second chart over the same data starts configured. The copy is a single tile with no clipboard or multi-select.

## Requirements

### Requirement: Duplicate copies a visual under its original

The dashboard editor SHALL let the owner duplicate a visual from its tile corner, producing a new tile with the same type, chart settings and data binding placed directly under the original.

#### Scenario: The copy keeps the original's configuration

- **GIVEN** a bar chart tile bound to a dataset query with custom chart settings
- **WHEN** the owner chooses Duplicate on that tile
- **THEN** a new tile appears under the original at the same width and height
- **AND** the new tile has the same chart type, settings and query

#### Scenario: The copy reads live data rather than a frozen snapshot

- **GIVEN** the original tile is bound to a published snapshot of its data
- **WHEN** the owner duplicates it
- **THEN** the copy is bound to the same query, not to the frozen snapshot

### Requirement: A duplicate is saved with the dashboard or taken back

The system SHALL save a duplicate with the dashboard as one edit, and SHALL remove the duplicate again when the save is refused.

#### Scenario: A refused save removes the duplicate

- **GIVEN** the owner duplicates a tile
- **WHEN** saving the dashboard is refused
- **THEN** the duplicate tile is removed

#### Scenario: A successful save keeps the duplicate

- **GIVEN** the owner duplicates a tile
- **WHEN** the dashboard saves
- **THEN** the duplicate tile is kept on the dashboard

### Requirement: Duplicating does not open the copy

The system SHALL NOT open the copy when it is created, so the owner stays on the dashboard.

#### Scenario: The new tile opens nothing

- **GIVEN** the owner duplicates a tile
- **WHEN** the copy appears
- **THEN** no editor opens for it
- **AND** clicking it later edits it like any other tile

### Requirement: Duplication is one tile at a time within one dashboard

The system SHALL duplicate one tile per action and SHALL NOT offer copying between dashboards or duplicating several tiles together.

#### Scenario: Several tiles cannot be duplicated together

- **GIVEN** the owner has several tiles on a dashboard
- **WHEN** they look for a multi-tile duplicate action
- **THEN** none is offered and each tile is duplicated on its own

#### Scenario: A tile cannot be pasted onto another dashboard

- **GIVEN** the owner has duplicated a tile on one dashboard
- **WHEN** they open a different dashboard
- **THEN** no paste action carries the tile over
