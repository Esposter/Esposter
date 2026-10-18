## Purpose

The map screen's runs: its names and glyphs over the terrain, and the Galesong Hill label.

## Requirements

### Requirement: The map's area names

The map's area names SHALL be scored over their glyphs' silhouettes and SHALL differ from the reference by no more than 2 percent on average.

#### Scenario: Names with no place in the catalogue are scored against bare ground

- **GIVEN** a map area name has no place in the catalogue, so none is drawn
- **WHEN** its silhouette is scored
- **THEN** it is scored against the page's bare ground
- **AND** the names do not pass the 2 percent bar

#### Scenario: Names within 2 percent on average pass

- **GIVEN** the names are drawn over the terrain
- **WHEN** each silhouette's masked mean difference is at or below 2 percent
- **THEN** the names pass

### Requirement: The Galesong Hill label

The Galesong Hill label SHALL differ from the English map's reference by no more than 2 percent on average over its region.

#### Scenario: A label that misses the 2 percent bar stays unapproved

- **GIVEN** the Galesong Hill label is compared against the English map's still
- **WHEN** the region's mean difference is above 2 percent
- **THEN** the label stays unapproved

#### Scenario: The label reads the same percentage as the still

- **GIVEN** the English map's still shows Galesong Hill at 99 percent
- **WHEN** the label is drawn
- **THEN** the label reads Exploration Progress at 99 percent
