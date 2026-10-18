## Purpose

The witness runs that lay out the capitals as the game draws them, owed for Fontaine.

## Requirements

### Requirement: The capital areas of Nod-Krai and Snezhnaya

The capital areas of Nod-Krai and Snezhnaya SHALL be outlined from the game's own area polygons once the community dump holds them.

#### Scenario: The game's own outline replaces the provisional square

- **GIVEN** the community dump holds the polygon of each capital's area
- **WHEN** the outlines are fitted
- **THEN** each capital's outline is the game's own
- **AND** Everfrozen Earth's provisional square is replaced

#### Scenario: A capital whose polygon is missing from the dump gets no outline yet

- **GIVEN** the community dump lacks a capital's area polygon
- **WHEN** the outlines are fitted
- **THEN** that capital's outline is not written

### Requirement: The capital outlines

The capital outlines SHALL be drawn the way every other capital's area is already outlined on the world map.

#### Scenario: New capital outlines match the existing ones

- **GIVEN** the outlines of Nod-Krai and Snezhnaya are fitted
- **WHEN** the world map draws them
- **THEN** they are outlined the same way as every other capital's area
