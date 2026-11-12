## MODIFIED Requirements

### Requirement: A selection of three or more boxes distributes with equal gaps

Distribute SHALL space a selection of three or more boxes evenly, horizontally or vertically, keeping the two outermost boxes in place, as one undo step. A selection in which one box starts before every other box and ends after every other box along the axis has no outer pair to keep in place, so distribute SHALL be disabled for it and SHALL move no box.

#### Scenario: Distributing horizontally makes every gap equal

- **GIVEN** three shapes of different widths with uneven gaps between them
- **WHEN** the owner distributes them horizontally
- **THEN** each gap between neighbouring shapes is the same
- **AND** the leftmost and the rightmost shapes have not moved

#### Scenario: Distribute is disabled below three boxes

- **GIVEN** a selection of two shapes
- **WHEN** the owner looks at the distribute controls
- **THEN** every distribute control is disabled

#### Scenario: A box that spans the others disables distribute

- **GIVEN** a selection of three boxes in which one box starts at the left of the others and ends at the right of them
- **WHEN** the owner looks at the distribute controls
- **THEN** every distribute control is disabled
- **AND** pressing none of them moves a box

#### Scenario: Distribute of boxes that do not span the others is unchanged

- **GIVEN** a selection of three boxes in which no box starts first and ends last
- **WHEN** the owner distributes them horizontally
- **THEN** the two outermost boxes stay in place and the gaps between neighbours are equal
