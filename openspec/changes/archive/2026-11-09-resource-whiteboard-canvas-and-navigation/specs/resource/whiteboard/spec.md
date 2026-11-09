## REMOVED Requirements

### Requirement: Elements snap to the grid

**Reason**: The whiteboard draws a plain canvas and places an element where the pointer puts it. A snap with no visible grid is behaviour nothing explains, and the dot grid is noise behind freehand work.

**Migration**: Elements already placed stay where they are. An element is placed exactly by the arrow-key nudge.

## ADDED Requirements

### Requirement: The canvas is plain

The canvas SHALL draw its elements on a plain background and SHALL draw no grid. A move, a resize and a placement SHALL land where the pointer puts them, and the editor SHALL hold no snap setting.

#### Scenario: A moved shape lands where the pointer puts it

- **GIVEN** a Process shape on the canvas
- **WHEN** the owner drags the shape by an offset that is not a multiple of any step
- **THEN** the shape's top-left corner has moved by exactly that offset

#### Scenario: The canvas draws no grid

- **GIVEN** an open whiteboard
- **WHEN** the canvas is drawn
- **THEN** it draws no grid pattern behind the elements
- **AND** the toolbar offers no snap toggle

### Requirement: The wheel pans and a pinch zooms about the pointer

A wheel without a modifier SHALL pan the canvas by the wheel's delta. A wheel with Ctrl or Cmd held, and a trackpad pinch, SHALL zoom about the pointer, so the point under the pointer stays under it. Space held with a drag SHALL pan. The zoom SHALL stay between 0.1 and 30, and a zoom past either limit SHALL leave the viewport where the limit put it.

#### Scenario: The wheel pans

- **GIVEN** a canvas at its default viewport
- **WHEN** the owner scrolls the wheel by a vertical delta
- **THEN** the viewport has panned by that delta and its zoom is unchanged

#### Scenario: Ctrl and the wheel zoom about the pointer

- **GIVEN** a canvas with the pointer over a point of the board
- **WHEN** the owner scrolls the wheel with Ctrl held
- **THEN** the zoom changes
- **AND** the board point under the pointer is the same point as before

#### Scenario: Zoom stops at the limits

- **GIVEN** a canvas already at the maximum zoom
- **WHEN** the owner zooms in again
- **THEN** the zoom stays at the maximum

#### Scenario: Space and a drag pan

- **GIVEN** a canvas with a tool other than the hand tool active
- **WHEN** the owner holds Space and drags
- **THEN** the viewport pans by the drag and no element is created or moved

### Requirement: The keyboard resets and fits the view

Ctrl or Cmd with 0 SHALL reset the zoom to 1 about the centre of the view. Shift with 1 SHALL fit every element in the view, and Shift with 2 SHALL fit the selection, each with the zoom held within its limits. With nothing to fit, the viewport SHALL stay where it is.

#### Scenario: Shift and 1 fit the content

- **GIVEN** a whiteboard with elements outside the view
- **WHEN** the owner presses Shift and 1
- **THEN** every element lies inside the view

#### Scenario: Fitting an empty board changes nothing

- **GIVEN** a whiteboard with no elements
- **WHEN** the owner presses Shift and 1
- **THEN** the viewport is unchanged

### Requirement: The owner selects every element at once

Ctrl or Cmd with A SHALL select every element, except while text is being edited, where it selects the text.

#### Scenario: Select all selects every element

- **GIVEN** a whiteboard with several elements
- **WHEN** the owner presses Ctrl and A
- **THEN** every element is selected

#### Scenario: Select all while editing text selects the text

- **GIVEN** an element's text open for editing
- **WHEN** the owner presses Ctrl and A
- **THEN** the selection of elements is unchanged

### Requirement: Elements are copied and cut

Ctrl or Cmd with C SHALL write the selected elements to the clipboard as JSON text carrying a marker. Ctrl or Cmd with X SHALL do the same and delete them as one undo step.

#### Scenario: Cut and its paste undo separately

- **GIVEN** a shape cut and then pasted
- **WHEN** the owner undoes once
- **THEN** only the paste is reverted

### Requirement: Elements are pasted from the clipboard

Ctrl or Cmd with V SHALL read the clipboard, and when it carries the marker, add copies of the elements offset from the originals, with fresh ids, selected, as one undo step. An arrow copied with its bound shapes SHALL stay bound to the pasted copies, and an arrow copied without them SHALL paste with those ends free. Clipboard text without the marker SHALL be left to the other paste handlers.

#### Scenario: Paste adds offset copies with fresh ids

- **GIVEN** a shape copied to the clipboard
- **WHEN** the owner pastes
- **THEN** a second shape exists with a different id and an offset position
- **AND** the pasted shape is the selection

#### Scenario: A pasted arrow is bound to the pasted shapes

- **GIVEN** an arrow and the two shapes it is bound to, all copied
- **WHEN** the owner pastes
- **THEN** the pasted arrow is bound to the pasted shapes and not to the originals

#### Scenario: An arrow pasted without its shapes has free ends

- **GIVEN** only an arrow copied, whose ends were bound
- **WHEN** the owner pastes
- **THEN** the pasted arrow's ends are free

#### Scenario: Clipboard text without the marker is ignored

- **GIVEN** clipboard text that is not a copied-elements payload
- **WHEN** the owner pastes on the canvas
- **THEN** no element is added by this handler
