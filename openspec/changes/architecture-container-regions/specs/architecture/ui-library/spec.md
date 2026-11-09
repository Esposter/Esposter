## ADDED Requirements

### Requirement: A frame owns its title bar, body and footer

The frame SHALL draw an optional title bar, a padded body that scrolls when its content is taller than the room the frame leaves, and an optional footer slot pinned after the body outside its scroll. A frame with no title, actions or footer content SHALL draw only the body.

#### Scenario: A long body scrolls under a pinned title bar and footer

- **GIVEN** a frame with a title, a footer and a body taller than the frame
- **WHEN** the reader scrolls the body
- **THEN** the title bar and the footer stay in view

#### Scenario: A frame with no title draws only the body

- **GIVEN** a frame with no title, no actions and no footer content
- **WHEN** the frame is drawn
- **THEN** no title bar and no footer region exist

### Requirement: A blade and a region own their padding and scroll

The blade outlet, the editor shell's regions, the right sidebar's panes and the settings content SHALL each draw their body padded and scrolling, with the body's padding opted out by one flag. A call site SHALL NOT draw its own padded scroll wrapper inside one of them.

#### Scenario: A blade's content is padded and scrolls

- **GIVEN** a blade whose content is taller than the blade
- **WHEN** the reader scrolls
- **THEN** the content scrolls inside the blade and nothing extends past it

#### Scenario: A full-bleed region opts out of the padding

- **GIVEN** a region opted out of the body's padding
- **WHEN** the region is drawn
- **THEN** its content touches the region's edges

### Requirement: An async body draws the state a list is in

A list's async body SHALL draw its loading slot while the read is pending, its error slot with a retry when the read failed, its empty slot when the read returned nothing, and its content otherwise.

#### Scenario: A pending read draws the loading slot

- **GIVEN** a list whose read is pending
- **WHEN** the body is drawn
- **THEN** the loading content is drawn and the list content is not

#### Scenario: A failed read draws the error slot with a retry

- **GIVEN** a list whose read failed
- **WHEN** the reader presses retry
- **THEN** the read is made again

#### Scenario: An empty read draws the empty slot

- **GIVEN** a list whose read returned no items
- **WHEN** the body is drawn
- **THEN** the empty content is drawn

### Requirement: A dialog takes a named size

A dialog SHALL take its width from a named size on the base dialog, and a call site SHALL NOT set a width literal on it.

#### Scenario: A named size sets the width

- **GIVEN** a dialog of the Large size on a wide screen
- **WHEN** the dialog is open
- **THEN** its width is the Large size's width, and on a narrow screen it is held to the viewport
