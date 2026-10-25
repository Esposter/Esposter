## MODIFIED Requirements

### Requirement: Zoom is available on scatter visuals only

The dashboard SHALL allow zooming on scatter visuals and SHALL instead allow a range to be brushed on the other chart visuals, a card and a table drawing no chart to brush.

#### Scenario: A scatter can be zoomed on both axes

- **GIVEN** a scatter visual
- **WHEN** the viewer zooms it
- **THEN** both axes zoom

#### Scenario: A bar visual is brushed rather than zoomed

- **GIVEN** a bar visual
- **WHEN** the viewer brushes a range
- **THEN** the chart narrows to that range
