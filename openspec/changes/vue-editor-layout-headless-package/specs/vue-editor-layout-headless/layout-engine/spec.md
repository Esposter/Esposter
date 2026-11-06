## ADDED Requirements

### Requirement: A panel is present only while its condition holds

A resolved layout SHALL contain a panel only when its condition matches the context's mode, tool and selection kind, where a missing or empty list matches anything.

#### Scenario: A panel is present only while its condition holds

- **GIVEN** a panel shown for the select tool only
- **WHEN** the layout is resolved with the pan tool in hand
- **THEN** the panel is absent
- **AND** with the select tool in hand it is present

### Requirement: A panel's content follows the selection kind

A present panel SHALL show the content its table names for the context's selection kind, and its wildcard content when the table has no entry for the kind.

#### Scenario: Content follows the selection kind

- **GIVEN** a properties panel with entries for an arrow and a wildcard
- **WHEN** the layout is resolved with an arrow selected and again with a shape selected
- **THEN** the arrow's content is shown for the arrow
- **AND** the wildcard content is shown for the shape

#### Scenario: A kind with no entry and no wildcard shows no panel

- **GIVEN** a panel whose table has no wildcard and no entry for the selection kind
- **WHEN** the layout is resolved
- **THEN** the panel is absent

### Requirement: A region with no present panel is omitted

A resolved layout SHALL omit a region that holds no present panel, and SHALL always contain the canvas.

#### Scenario: An empty region is omitted

- **GIVEN** a region whose only panel's condition fails
- **WHEN** the layout is resolved
- **THEN** the region is absent
- **AND** the canvas is present

### Requirement: A region's presentation follows the size class

A resolved region SHALL be presented as the layout declares for the window's size class, as docked, overlay, sheet or hidden.

#### Scenario: A region's presentation follows the size class

- **GIVEN** a region docked when expanded and a sheet when compact
- **WHEN** the layout is resolved for each class
- **THEN** the region is docked when expanded
- **AND** it is a sheet when compact

### Requirement: A region can sit at another edge for a size class

A resolved region SHALL be at the edge the layout declares for the window's size class, and at its default edge where the layout declares none.

#### Scenario: A toolbar moves to the bottom when compact

- **GIVEN** a tool region at the top edge, declared at the bottom edge when compact
- **WHEN** the layout is resolved for each class
- **THEN** the region is at the top edge when expanded
- **AND** it is at the bottom edge when compact

### Requirement: A sheet waits for the reader

A region presented as a sheet SHALL stay closed until the reader opens it, whether it opens with its content or on demand.

#### Scenario: A sheet waits for the reader

- **GIVEN** a properties region that opens with its content, presented as a sheet when compact
- **WHEN** the layout is resolved for a compact window with something selected
- **THEN** the region is present and closed

#### Scenario: A docked region opens with its content

- **GIVEN** the same region presented docked when expanded
- **WHEN** the layout is resolved for an expanded window with something selected
- **THEN** the region is open

### Requirement: A resize stays within the region's limits

A resize SHALL set a region's size to the size asked for, held between the region's minimum and maximum.

#### Scenario: A resize stays within the region's limits

- **GIVEN** a region with a minimum of 200 and a maximum of 400
- **WHEN** it is resized to 300
- **THEN** its size is 300

#### Scenario: A resize past a limit is clamped

- **GIVEN** a region with a minimum of 200 and a maximum of 400
- **WHEN** it is resized to 900 and to 10
- **THEN** the sizes are 400 and 200

### Requirement: A stored state is read against the layout

Parsing a stored reader state SHALL drop every id the layout does not name and clamp every size to its region's limits, and SHALL answer the default state for a value that is not a state.

#### Scenario: A stale id is dropped from a stored state

- **GIVEN** a stored state that names a region the layout no longer has
- **WHEN** it is parsed against the layout
- **THEN** the state holds no entry for that region

#### Scenario: A stored size outside the limits is clamped

- **GIVEN** a stored size above its region's maximum
- **WHEN** it is parsed against the layout
- **THEN** the size is the maximum

#### Scenario: A value that is not a state gives the default

- **GIVEN** a stored value that is a number
- **WHEN** it is parsed against the layout
- **THEN** the default state is answered

### Requirement: The layout check reports every gap

The layout check SHALL report each selection kind a present panel has no content for, each content key not registered, each duplicate id and each panel in a region that does not exist.

#### Scenario: A selection kind with no content is reported

- **GIVEN** an editor with selection kinds shape and arrow, and a panel with content for shape only
- **WHEN** the layout is checked
- **THEN** a finding names the arrow

#### Scenario: A content key nobody registered is reported

- **GIVEN** a panel whose content names a key the editor did not register
- **WHEN** the layout is checked
- **THEN** a finding names the key

#### Scenario: A duplicate id is reported

- **GIVEN** two panels with one id
- **WHEN** the layout is checked
- **THEN** a finding names the id

#### Scenario: A panel in a region that does not exist is reported

- **GIVEN** a panel naming a region the layout lacks
- **WHEN** the layout is checked
- **THEN** a finding names the panel

### Requirement: Resolving and changing state never mutate their inputs

The engine's functions SHALL return new values and SHALL leave the layout, the context and the reader state they were given unchanged.

#### Scenario: A resize leaves the given state unchanged

- **GIVEN** a reader state
- **WHEN** a region is resized from it
- **THEN** the given state still holds its old size
- **AND** the answer holds the new one

### Requirement: A reactive context re-resolves the layout

The layout composable SHALL answer the resolved layout for its reactive context and SHALL answer a new one when the mode, the tool, the selection or the size class changes.

#### Scenario: A change of selection re-resolves the layout

- **GIVEN** a layout composable over a layout with a properties panel and nothing selected
- **WHEN** the selection becomes an arrow
- **THEN** the resolved layout holds the properties panel's arrow content

#### Scenario: A resize is kept in the reader's state

- **GIVEN** a layout composable and a region with limits
- **WHEN** the region is resized past its maximum
- **THEN** the reader's state holds the maximum
