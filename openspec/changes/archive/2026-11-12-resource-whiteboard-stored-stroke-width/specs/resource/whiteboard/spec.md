## ADDED Requirements

### Requirement: A stored width that is not one of the three is brought to a step, not read leniently

A saved whiteboard holding an outline, route or stroke width that is not thin, medium or bold SHALL be brought to the nearest of the three by a backfill, so every stored document parses against the element schema, and no read SHALL accept a width outside the three. A width exactly halfway between two steps SHALL be brought to the thinner of the two, so a width of 3, halfway between medium and bold, becomes medium.

#### Scenario: A stored stroke written at a width of 3 is brought to a step

- **GIVEN** a saved whiteboard with a freehand stroke stored at a width of 3, written by an agent before the three steps
- **WHEN** the backfill runs
- **THEN** the stroke is stored at medium width
- **AND** the whiteboard parses against the element schema

#### Scenario: A stored width already on a step is left alone

- **GIVEN** a saved whiteboard whose strokes are all stored at thin, medium or bold
- **WHEN** the backfill runs
- **THEN** the saved content is unchanged
