## ADDED Requirements

### Requirement: A dragged element snaps to the edges and centres of the others

The owner's drag of a shape, sticky note or text box SHALL snap the element's edges and centre to the nearest edge, centre or edge midpoint of another element within a short distance, and SHALL leave the element where the pointer puts it when none is in range.

#### Scenario: A dragged element snaps its edge to a neighbour's edge

- **GIVEN** a Process shape and a second shape whose left edge is 3 units from the first shape's left edge
- **WHEN** the owner drags the first shape until its left edge is within the snap distance of the second shape's left edge
- **THEN** the first shape's left edge lands on the second shape's left edge

#### Scenario: A dragged element snaps its centre to a neighbour's edge midpoint

- **GIVEN** a Process shape and a second shape whose bottom edge midpoint is within the snap distance of the first shape's centre
- **WHEN** the owner drags the first shape to that point
- **THEN** the first shape's centre lands on the second shape's bottom edge midpoint

#### Scenario: An element outside the snap distance does not snap

- **GIVEN** a Process shape and a second shape
- **WHEN** the owner drags the first shape with no edge or centre within the snap distance of the second shape
- **THEN** the element lands where the pointer puts it

#### Scenario: Holding Alt places the element exactly where the pointer is

- **GIVEN** a Process shape near another shape's edge
- **WHEN** the owner drags the first shape with Alt held
- **THEN** the element lands where the pointer puts it

### Requirement: A guide shows each alignment a drag holds

The canvas SHALL draw a guide line for each alignment a drag currently holds and SHALL clear the guides when the drag ends.

#### Scenario: A guide shows while the drag holds an alignment and clears at its end

- **GIVEN** a drag that has snapped a shape's edge to another shape's edge
- **WHEN** the owner is still dragging
- **THEN** a guide line runs along the aligned edge
- **AND** the guide is gone once the owner releases the pointer
