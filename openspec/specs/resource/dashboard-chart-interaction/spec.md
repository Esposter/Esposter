## Purpose

The ApexCharts investigation surface on dashboard visuals — undo/redo, context menu, ruler, annotation authoring, linked highlighting and shareable view state, and the watermark they are accepted with. The features apply to dashboard visuals only.

## Requirements

### Requirement: A dashboard chart can be investigated with undo, menus, a ruler and annotations

The dashboard SHALL give each visual undo and redo, a right-click menu on points, a measuring ruler and editable annotations.

#### Scenario: Undo reverts a zoom

- **GIVEN** the viewer has zoomed a visual
- **WHEN** they press Ctrl+Z
- **THEN** the zoom is reverted

#### Scenario: Redo reapplies an undone change

- **GIVEN** the viewer has undone a series toggle
- **WHEN** they redo
- **THEN** the series toggle is applied again

#### Scenario: Right-clicking a point opens actions for that point

- **GIVEN** a visual shows points
- **WHEN** the viewer right-clicks a point
- **THEN** a menu opens with actions for that point

#### Scenario: Holding and dragging measures the change between two points

- **GIVEN** a visual shows points
- **WHEN** the viewer holds and drags between two points
- **THEN** the change, percentage and slope between them are shown

#### Scenario: An annotation can be moved, resized and restyled

- **GIVEN** the viewer has added an annotation to a visual
- **WHEN** they drag, resize or restyle it
- **THEN** the change takes effect and can be undone

### Requirement: Annotations are not saved with the dashboard

The dashboard SHALL NOT keep annotations after the viewer leaves the page.

#### Scenario: Annotations disappear on reload

- **GIVEN** the viewer has annotated a visual
- **WHEN** they reload the dashboard
- **THEN** the annotations are gone

### Requirement: Zoom is available on scatter visuals only

The dashboard SHALL allow zooming on scatter visuals and SHALL instead allow a range to be brushed on the other visual types.

#### Scenario: A scatter can be zoomed on both axes

- **GIVEN** a scatter visual
- **WHEN** the viewer zooms it
- **THEN** both axes zoom

#### Scenario: A bar visual is brushed rather than zoomed

- **GIVEN** a bar visual
- **WHEN** the viewer brushes a range
- **THEN** the chart narrows to that range

### Requirement: Brushing one linked visual dims the others in its set

The dashboard SHALL link visuals that draw the same rows on the same category axis, so that brushing one dims marks outside the range on every linked visual.

#### Scenario: Two visuals on the same rows and axis move together

- **GIVEN** two visuals are bound to the same dataset and grouped by the same column
- **WHEN** the viewer brushes a range on one
- **THEN** the marks outside that range dim on the other

#### Scenario: Visuals on different axes do not link

- **GIVEN** two visuals use the same dataset but group by different columns
- **WHEN** the viewer brushes a range on one
- **THEN** the other visual does not change

#### Scenario: Visuals with no axis are not linked

- **GIVEN** a pie visual sits on the same dataset as a bar visual
- **WHEN** the viewer brushes the bar visual
- **THEN** the pie visual does not change

#### Scenario: An unbound visual is not linked

- **GIVEN** a visual is not bound to a dataset
- **WHEN** the viewer brushes another visual
- **THEN** the unbound visual does not change

### Requirement: A shared link carries each visual's view

The dashboard SHALL put each visual's zoom, hidden series and selection in the address, so that a link restores the view its sender had.

#### Scenario: A link restores a zoomed visual

- **GIVEN** the viewer zoomed a visual and copied the link
- **WHEN** the recipient opens the link
- **THEN** the visual opens with the same zoom

#### Scenario: A link carries every visual the sender touched

- **GIVEN** the viewer changed two visuals before copying the link
- **WHEN** the recipient opens the link
- **THEN** both visuals open in the sender's state

#### Scenario: A damaged link opens the dashboard unfiltered

- **GIVEN** a link's view state can no longer be read
- **WHEN** the recipient opens it
- **THEN** the dashboard opens with every visual in its default state
- **AND** no error is shown

### Requirement: Interaction features carry the vendor watermark

The dashboard SHALL show the charting vendor's watermark on every chart that uses these interaction features, on both the editor and the published page.

#### Scenario: A chart with undo and menus shows the watermark in the editor

- **GIVEN** the owner opens a dashboard with a visual
- **WHEN** the visual draws
- **THEN** the vendor watermark repeats over the chart

#### Scenario: The published page shows the watermark too

- **GIVEN** a dashboard is published
- **WHEN** a viewer opens the public page
- **THEN** the vendor watermark repeats over each chart

### Requirement: Canvas rendering and the other vendor modes stay off

The dashboard SHALL NOT offer the vendor's canvas rendering, cross-filter mode, streaming, storyboard, theme-following or custom plugin features.

#### Scenario: A bucket click does not re-aggregate other charts

- **GIVEN** a visual is on the dashboard
- **WHEN** the viewer clicks a bar
- **THEN** no other visual is re-aggregated from it
