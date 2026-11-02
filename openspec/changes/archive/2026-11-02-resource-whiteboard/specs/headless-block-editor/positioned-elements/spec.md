## ADDED Requirements

### Requirement: The core holds typed elements placed by bounds and ordered by z-order

The headless editor core SHALL hold a document of typed positioned elements, each with its bounds, and SHALL take z-order from the order of the element list.

#### Scenario: A document of typed elements parses with bounds and z-order

- **GIVEN** a document of a rectangle, an arrow and a sticky note in that order
- **WHEN** the document is parsed
- **THEN** each element parses with its type, its bounds and its fields
- **AND** the rectangle is drawn beneath the arrow and the sticky note in z-order

### Requirement: An arrow's binding is a reference the core checks

An arrow end bound to a shape SHALL name an element that exists in the document and a connection point that element has, and an element that takes no connection SHALL refuse a binding.

#### Scenario: An arrow bound to a missing shape is refused

- **GIVEN** a document with no shape of a given id
- **WHEN** an arrow binds an end to that id
- **THEN** the document is refused
- **AND** no operation applies

#### Scenario: An annotation refuses a binding

- **GIVEN** an annotation element in a document
- **WHEN** an arrow binds an end to the annotation
- **THEN** the binding is refused

### Requirement: Commands return the patch that changes the document

Each command SHALL return the JSON Patch operations that change the document, and a move SHALL include the reroute of each arrow bound to the moved shape.

#### Scenario: Moving a shape reroutes its bound arrows in the same edit

- **GIVEN** a shape with an arrow bound to its connection point
- **WHEN** the move command moves the shape
- **THEN** the returned operations move the shape and reroute the arrow
- **AND** applying them leaves the arrow attached to the shape's point

#### Scenario: Deleting a shape removes arrows bound only to it

- **GIVEN** a shape with an arrow bound to it at one end and another shape at the other
- **WHEN** the delete command removes the shape
- **THEN** the returned operations unbind the arrow's shape end
- **AND** an arrow bound only to the removed shape is removed with it

### Requirement: Geometry and hit testing run without a DOM

The core SHALL compute a shape's outline, its connection points and the hit test of a point, without a DOM.

#### Scenario: A click on a diamond's edge hits it and its corner misses

- **GIVEN** a diamond of known bounds
- **WHEN** a point on its edge and a point at its bounding box's corner are tested
- **THEN** the edge point hits the diamond
- **AND** the corner point misses it

### Requirement: Arrows route between connection points by their path kind

The core SHALL compute a straight, a curved and a right-angled path between two connection points, a right-angled path leaving each shape along the direction of its connection point.

#### Scenario: A right-angled arrow leaves a shape from its bottom point

- **GIVEN** a shape and a connection point on its bottom edge
- **WHEN** a right-angled arrow is routed from that point
- **THEN** the route's first segment leaves the shape downwards

### Requirement: Undo reverts a command's operations as one step

The core SHALL undo a command by its inverse operations, as one history entry.

#### Scenario: An undo reverts a move and its reroute together

- **GIVEN** a move command applied with its reroute
- **WHEN** the history undoes it
- **THEN** the shape and its arrow return to their positions before the move
