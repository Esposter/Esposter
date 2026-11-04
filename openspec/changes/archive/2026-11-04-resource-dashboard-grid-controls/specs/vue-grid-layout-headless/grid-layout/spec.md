## ADDED Requirements

### Requirement: An item steps by whole cells from the keyboard

The package SHALL step an item by whole cells, placed as a gesture is placed, and SHALL commit the step once when it lands.

#### Scenario: A step onto a free cell is committed

- **GIVEN** an item with free cells to its right
- **WHEN** the consumer steps it one column right
- **THEN** the grid commits the item at the new cell once

#### Scenario: A step past the columns is clamped

- **GIVEN** an item at the last column
- **WHEN** the consumer steps it right
- **THEN** the item keeps its cell and the grid commits nothing

#### Scenario: A resize step never shrinks an item below one cell

- **GIVEN** an item one cell wide
- **WHEN** the consumer steps its width down
- **THEN** the item stays one cell wide and the grid commits nothing

#### Scenario: A step onto another item under prevent is refused

- **GIVEN** the prevent mode and an item beside the stepped one
- **WHEN** the consumer steps the item onto it
- **THEN** the grid commits nothing and the step reports that it was refused

### Requirement: A dragged-in item previews its landing cell

The package SHALL show an item dragged in from outside any grid where it would land on the grid under the pointer, and SHALL mark the preview refused when the grid would refuse the drop.

#### Scenario: Hovering the grid previews the landing cell

- **GIVEN** a palette entry dragged over an empty cell of the grid
- **WHEN** the pointer is over the grid
- **THEN** the placeholder is drawn at the cell it would land on
- **AND** it is not marked refused

#### Scenario: Hovering an item under prevent previews a refusal

- **GIVEN** the prevent mode and a palette entry dragged over an item of the grid
- **WHEN** the pointer is over the item
- **THEN** the placeholder is marked refused

#### Scenario: Leaving the grid clears the preview

- **GIVEN** a palette entry previewed over the grid
- **WHEN** the pointer leaves the grid
- **THEN** the placeholder is removed

### Requirement: The package finds the first free cell for a new item

The package SHALL find the first cell a new item of a given span fits in, scanning rows from the top and columns from the left.

#### Scenario: A new item next to existing items

- **GIVEN** a grid whose first row holds two items, four columns wide
- **WHEN** a new item two columns wide is placed
- **THEN** it takes the first row's free cell right of them

## ADDED Requirements

### Requirement: Items drop in from outside the grid

The package SHALL take an item dragged in from outside every grid, and SHALL return an item released over no grid to where it was.

#### Scenario: Dropping a palette entry into the grid

- **GIVEN** a palette entry dragged with the span it would take
- **WHEN** it is released over an empty cell of the grid
- **THEN** the entry is placed at that cell and the grid commits the items it pushes

#### Scenario: A drop outside every grid

- **GIVEN** a palette entry dragged over no grid
- **WHEN** it is released
- **THEN** nothing is committed

#### Scenario: A palette entry dropped onto an item under prevent is refused

- **GIVEN** the prevent mode and a palette entry dragged with the span it would take
- **WHEN** it is released over an item of the grid
- **THEN** the grid commits nothing

#### Scenario: A dropped item wider than the grid is narrowed to its columns

- **GIVEN** a palette entry wider than the grid's columns
- **WHEN** it is released over the grid's first column
- **THEN** the entry is placed at the first column, spanning every column

#### Scenario: A cancelled palette press accepts once on the next release

- **GIVEN** a palette press that the browser cancels
- **WHEN** the pointer is pressed and released again over the grid
- **THEN** the entry is placed once

## REMOVED Requirements

### Requirement: A nested grid owns its items' gestures

**Reason**: No consumer draws a grid inside an item, and the dashboard's grouping of visuals does not exist, so the press routing for nested grids is removed with the cross-grid move. It returns with the grouping that needs it.

### Requirement: Items drop in from outside and between grids

**Reason**: Replaced by "Items drop in from outside the grid". The move of an item from one grid into another is removed, since the dashboard shows one grid at a time and nothing releases a visual over a second grid.
