## ADDED Requirements

### Requirement: The canvas draws the page at the chosen device width

The canvas SHALL draw the webpage at the device width chosen in the toolbar, with the layout the published page has at that width.

#### Scenario: Switching to tablet draws the page at tablet width

- **GIVEN** a webpage open in the editor
- **WHEN** the owner switches the device toggle to tablet
- **THEN** the canvas is 768 pixels wide
- **AND** the page shows its tablet layout

#### Scenario: A narrow pane scales the desktop canvas down

- **GIVEN** a webpage open in the editor in a pane narrower than the desktop width
- **WHEN** the owner views the desktop canvas
- **THEN** the page keeps its desktop layout
- **AND** the canvas is scaled down to fit the pane

### Requirement: The page's styles and scripts stay apart from the editor

The canvas SHALL keep the page's styles out of the editor, the editor's styles out of the page, and any script inside a custom HTML block from running in the canvas.

#### Scenario: A page's body style does not restyle the editor

- **GIVEN** a webpage whose body sets a background colour
- **WHEN** the owner edits the page
- **THEN** the editor's panels keep the app's colours

#### Scenario: A script inside a custom HTML block does not run in the canvas

- **GIVEN** a custom HTML block containing a script that changes the page title
- **WHEN** the block is shown in the canvas
- **THEN** the script does not run
- **AND** the page title is unchanged

### Requirement: Hovering and selecting a node shows its outline

Hovering a node SHALL outline it, and selecting a node SHALL show a selection outline and the node's toolbar.

#### Scenario: Hovering a node outlines it and clicking selects it

- **GIVEN** a webpage open in the editor
- **WHEN** the owner hovers a text node and then clicks it
- **THEN** the node is outlined while the pointer is over it
- **AND** clicking it shows the selection outline and the node's toolbar

### Requirement: A block dragged from the palette drops into the slot under the pointer

A block dragged from the palette SHALL drop into the nearest slot under the pointer that accepts its type, and SHALL be cancelled where no such slot exists.

#### Scenario: Dragging a block into a column inserts it there

- **GIVEN** a column in the page
- **WHEN** the owner drags a text block from the palette and releases it inside the column between two of its blocks
- **THEN** the text block is inserted at that position in the column

#### Scenario: Dropping a block where no slot accepts it cancels the drop

- **GIVEN** a drag of a block from the palette
- **WHEN** the owner releases it over a place where no slot accepts the block
- **THEN** no block is inserted

#### Scenario: Escape cancels a drag

- **GIVEN** a drag of a block from the palette in progress
- **WHEN** the owner presses Escape
- **THEN** the drag ends
- **AND** no block is inserted

### Requirement: Alt with an arrow key moves the selected node

Alt with an arrow key SHALL move the selected node among its siblings or into and out of a container, and SHALL announce each move while keeping focus on the node.

#### Scenario: Alt Down moves the selected node after its next sibling

- **GIVEN** a selected node with a next sibling
- **WHEN** the owner presses Alt and Down
- **THEN** the node moves after its next sibling
- **AND** the move is announced as the node's new position among its siblings
- **AND** focus stays on the node

#### Scenario: Alt Right moves a node into the previous sibling

- **GIVEN** a selected node with a previous sibling that holds a slot accepting it
- **WHEN** the owner presses Alt and Right
- **THEN** the node moves to the end of that sibling's slot

#### Scenario: Alt Left moves a node out after its parent

- **GIVEN** a selected node inside a container
- **WHEN** the owner presses Alt and Left
- **THEN** the node moves to just after its container

### Requirement: Move to offers only the slots that accept the node

Move to SHALL list every slot in the page that accepts the selected node, each named by its position in the page, and SHALL move the node to the slot the owner chooses.

#### Scenario: Move to lists every slot that accepts the node

- **GIVEN** a selected image in a page with several columns
- **WHEN** the owner opens Move to
- **THEN** the list names each column that accepts an image, by its path in the page
- **AND** choosing one moves the image into that column

#### Scenario: Move to offers no slot that refuses the node

- **GIVEN** a selected button in a page
- **WHEN** the owner opens Move to
- **THEN** the list names no slot that refuses a button

### Requirement: The layers tree reaches every node from the keyboard

The layers tree SHALL reach every node of the page from the keyboard, and selecting a tree row SHALL select that node on the canvas.

#### Scenario: Arrow keys walk the layers tree and select the focused node

- **GIVEN** the layers tree focused on one node
- **WHEN** the owner presses Down
- **THEN** focus moves to the next node in the tree
- **AND** that node is selected on the canvas

#### Scenario: Typing a label in the tree moves focus to that node

- **GIVEN** the layers tree focused
- **WHEN** the owner types the start of a node's label
- **THEN** focus moves to the first node whose label starts with the typed text

### Requirement: Enter edits a text node in place

Enter on a selected text node SHALL begin editing its text on the canvas, and Escape SHALL end editing and return focus to the layers tree.

#### Scenario: Enter edits a text node in place

- **GIVEN** a selected text node
- **WHEN** the owner presses Enter
- **THEN** the text can be edited on the canvas
- **AND** focus is inside the text

#### Scenario: Escape leaves a text node being edited

- **GIVEN** a text node being edited
- **WHEN** the owner presses Escape
- **THEN** the edited text is kept as one undoable change
- **AND** focus returns to the node's row in the layers tree

### Requirement: Copied nodes paste between webpages and not into emails

Copying a node SHALL let the owner paste a separate copy of it into another webpage, and pasting a webpage node into an email SHALL be refused with a message.

#### Scenario: A node pasted into another webpage appears as a copy

- **GIVEN** a node copied from one webpage
- **WHEN** the owner pastes it into another webpage
- **THEN** the pasted node appears with the copied content

#### Scenario: Pasting a webpage node into an email is refused

- **GIVEN** a node copied from a webpage
- **WHEN** the owner pastes it into an email
- **THEN** no node is added to the email
- **AND** a message says the paste was refused

### Requirement: Deleting a node moves focus to a neighbour

Deleting a node SHALL move selection and focus to its next sibling, else its previous sibling, else its parent, so focus is never lost.

#### Scenario: Deleting a node moves focus to a neighbour

- **GIVEN** a node with a next sibling and a previous sibling
- **WHEN** the owner deletes the node
- **THEN** selection and focus move to the next sibling

### Requirement: The Content panel edits the selected node's fields

The Content panel SHALL show the fields of the selected node's type, and a change to a field SHALL show on the canvas.

#### Scenario: Editing a button's label in the Content panel shows on the canvas

- **GIVEN** a selected button on a page
- **WHEN** the owner changes its label in the Content panel
- **THEN** the button on the canvas shows the new label

### Requirement: An empty page offers the palette

A page with no nodes SHALL offer the palette in its canvas, so the first block can be added from there.

#### Scenario: An empty page offers the palette

- **GIVEN** a new webpage with no nodes
- **WHEN** the owner opens it in the editor
- **THEN** the canvas offers the palette's blocks
