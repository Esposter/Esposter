## ADDED Requirements

### Requirement: A distribute is disabled when one box spans the rest

Distribute SHALL be disabled for a selection in which one box starts before every other box and ends after every other box along the axis, since it has no outer pair to keep in place.

#### Scenario: A box that spans the others disables distribute

- **GIVEN** a selection of three boxes in which one box starts at the left of the others and ends at the right of them
- **WHEN** the owner looks at the distribute controls
- **THEN** every distribute control is disabled
- **AND** pressing none of them moves a box

#### Scenario: Distribute of boxes that do not span the others is unchanged

- **GIVEN** a selection of three boxes in which no box starts first and ends last
- **WHEN** the owner distributes them horizontally
- **THEN** the two outermost boxes stay in place and the gaps between neighbours are equal
