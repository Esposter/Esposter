## ADDED Requirements

### Requirement: A published visual has an accessible name

The owner SHALL give a visual alternative text of at most 250 characters, and a published tile SHALL be named by it, or by the visual's label when it has none.

#### Scenario: A published chart is named by its alternative text

- **GIVEN** a bar chart whose alternative text reads Sales by region, largest first
- **WHEN** a reader opens the published dashboard
- **THEN** the chart's tile is named Sales by region, largest first

#### Scenario: A visual with no alternative text is named by its label

- **GIVEN** a visual labelled Revenue with no alternative text
- **WHEN** a reader opens the published dashboard
- **THEN** the tile is named Revenue

#### Scenario: Alternative text over the limit is refused

- **GIVEN** a visual whose alternative text is longer than 250 characters
- **WHEN** the dashboard is saved
- **THEN** the save is refused

#### Scenario: The owner describes a visual

- **GIVEN** a visual selected in the editor
- **WHEN** the owner enters alternative text in the inspector
- **THEN** the dashboard saves it with the visual
