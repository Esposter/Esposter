## ADDED Requirements

### Requirement: A node's styles apply only to that node

A style set on a node SHALL apply only to that node, for the breakpoint and state it was set at.

#### Scenario: A style applies only to the node it was set on

- **GIVEN** two text nodes on a page
- **WHEN** the owner sets their text colour to red on one of them
- **THEN** the other text node keeps its colour

### Requirement: A breakpoint override applies at its width and below

A style set at a breakpoint SHALL apply at that breakpoint's width and below, over the base style, and a narrower breakpoint's override SHALL win over a wider one.

#### Scenario: A tablet override applies at 991 pixels and below

- **GIVEN** a text node with a base font size of 20 pixels and a tablet font size of 16 pixels
- **WHEN** the page is viewed 900 pixels wide
- **THEN** the text is 16 pixels
- **AND** when the page is viewed 1200 pixels wide the text is 20 pixels

#### Scenario: A mobile override wins over a tablet override

- **GIVEN** a text node with a tablet font size of 16 pixels and a mobile font size of 14 pixels
- **WHEN** the page is viewed 400 pixels wide
- **THEN** the text is 14 pixels

### Requirement: A hover style also applies on keyboard focus

A hover style SHALL also apply when a reader focuses a focusable element with the keyboard.

#### Scenario: A hover style also applies when a reader tabs to a button

- **GIVEN** a button with a hover colour set
- **WHEN** a reader moves keyboard focus onto the button
- **THEN** the hover colour is shown

### Requirement: A colour picked from the theme follows the theme

A colour picked from the theme SHALL be stored as a reference to the theme colour, so that changing the theme colour changes every node that uses it.

#### Scenario: Changing a theme colour recolours every node that uses it

- **GIVEN** two nodes whose text colour is the theme's Brand colour
- **WHEN** the owner changes the Brand colour in the theme
- **THEN** both nodes show the new colour

### Requirement: A style value the browser does not support is not saved

A style value that the browser does not support, or that holds braces or angle brackets or is over the length limit, SHALL NOT be saved.

#### Scenario: An unsupported style value stays in its field unsaved

- **GIVEN** a style field holding a value that was last saved
- **WHEN** the owner types a value the browser does not support
- **THEN** the field shows an error
- **AND** the node keeps its last saved value

#### Scenario: A style value with a brace is refused

- **GIVEN** a style field
- **WHEN** the owner types a value containing a brace
- **THEN** the value is refused and not saved

### Requirement: A field shows the value in effect and reset removes an override

A style field SHALL show the value in effect at the active breakpoint and state, and resetting it SHALL remove the override at that breakpoint and state.

#### Scenario: A field shows the inherited value and where it comes from

- **GIVEN** a text node with a desktop font size and no tablet override
- **WHEN** the owner selects the tablet breakpoint
- **THEN** the font size field shows the desktop value as a placeholder naming Desktop

#### Scenario: Reset removes an override

- **GIVEN** a text node with a tablet font size override
- **WHEN** the owner resets the font size at the tablet breakpoint
- **THEN** the tablet breakpoint shows the inherited font size again

### Requirement: Copy style and paste style carry styles to another node

Copy style and Paste style SHALL carry the styles of one node to another node.

#### Scenario: Paste style applies copied styles to another node

- **GIVEN** a node with styles at each breakpoint
- **WHEN** the owner copies its style and pastes it onto another node
- **THEN** the other node shows the copied styles at every breakpoint

### Requirement: A slider previews live and records one change when it settles

A slider drag SHALL preview its value on the canvas while dragging, and SHALL record one undoable change when the drag ends.

#### Scenario: Dragging an opacity slider records one undoable change

- **GIVEN** an opacity slider at 100 percent
- **WHEN** the owner drags it to 50 percent and releases it
- **THEN** the node shows the intermediate values during the drag
- **AND** one undoable change is recorded for the drag
