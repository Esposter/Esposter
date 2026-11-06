# resource/editor-drag-preview Specification

## Purpose

How the page builder, the survey Creator and the whiteboard show a dragged block before it lands: where it is drawn, what the pointer shows, and how the drag ends.

## Requirements

### Requirement: A drag shows the block where it would land

While a block is dragged over a place that accepts it, the editor SHALL draw that block in place among its neighbours, shifted to make room, so the result is visible before release.

#### Scenario: A palette kind is drawn in the slot it would land in

- **GIVEN** a drag from the palette over a slot that accepts the kind
- **WHEN** the pointer is over that slot
- **THEN** the slot shows the kind drawn with its defaults at the index the pointer resolves to

### Requirement: A preview changes nothing

A drag SHALL write nothing to the document or its history until release, and a cancelled drag SHALL leave both as they were.

#### Scenario: A cancelled drag leaves no history entry

- **GIVEN** a drag that has shown a preview
- **WHEN** the reader presses Escape
- **THEN** the document and the undo stack are unchanged

### Requirement: A release inserts or moves as one edit

A release over a place that accepts the block SHALL insert or move it as one history entry.

#### Scenario: A release inserts once

- **GIVEN** a drag over a slot that accepts the kind
- **WHEN** the reader releases
- **THEN** the kind is inserted at the previewed index as one history entry

### Requirement: A refused place says why

A drag over a place that does not accept the block SHALL show the rule that refuses it, and a release there SHALL insert nothing.

#### Scenario: A release on a refusing slot inserts nothing

- **GIVEN** a drag of a Column over a slot that does not accept it
- **WHEN** the reader releases
- **THEN** nothing is inserted and the refusal named the rule

### Requirement: A drag reaches what is off screen

A drag near the edge of the canvas SHALL scroll it, and a touch drag SHALL start only after a short hold.

#### Scenario: A drag at the edge scrolls

- **GIVEN** a drag that has started over a scrollable canvas
- **WHEN** the pointer stays near its edge
- **THEN** the canvas scrolls towards that edge

### Requirement: The survey Creator is draggable

The survey Creator SHALL take a drag from its palette and a drag of a placed element on its canvas, and the keyboard moves SHALL stay as the other way to the same edit.

#### Scenario: A question is dragged from the palette

- **GIVEN** a survey with a page
- **WHEN** the reader drags a Text kind from the palette onto the page
- **THEN** a Text question is inserted where the preview showed it
