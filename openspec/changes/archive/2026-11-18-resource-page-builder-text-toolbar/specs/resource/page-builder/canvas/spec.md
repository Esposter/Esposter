## ADDED Requirements

### Requirement: A text being edited shows a formatting toolbar

A text node being edited on the canvas SHALL show a formatting toolbar over the text in place of the node toolbar, and the toolbar SHALL go when the edit ends.

#### Scenario: Entering text edit shows the formatting toolbar over the text

- **GIVEN** a selected text node
- **WHEN** the owner presses Enter to edit the text
- **THEN** a formatting toolbar is shown over the text
- **AND** the toolbar holds the bold, italic and code marks, the paragraph and heading controls, the list controls, blockquote and a link control

#### Scenario: The node toolbar gives way to the text toolbar while editing

- **GIVEN** a text node being edited
- **WHEN** the owner looks at the canvas
- **THEN** the node toolbar is not shown
- **AND** the text toolbar is shown

#### Scenario: The text toolbar sits above its text when the canvas has room

- **GIVEN** a text node being edited with room above it in the canvas
- **WHEN** the owner looks at the text toolbar
- **THEN** it sits above the text, clear of its top edge

#### Scenario: Leaving the text edit hides the text toolbar

- **GIVEN** a text node being edited
- **WHEN** the owner presses Escape
- **THEN** the text toolbar is hidden

### Requirement: The text toolbar's controls format the selected words

The text toolbar's controls SHALL format the words the owner has selected, and the link control SHALL link them or remove the link.

#### Scenario: The bold control bolds the selected words

- **GIVEN** a text node being edited with some words selected
- **WHEN** the owner presses the bold control
- **THEN** the selected words are bold

#### Scenario: The link control links the selected words

- **GIVEN** a text node being edited with some words selected
- **WHEN** the owner enters an address in the link control and applies it
- **THEN** the selected words are a link to that address

#### Scenario: Clearing the link address removes the link

- **GIVEN** words that are a link
- **WHEN** the owner clears the address in the link control and applies it
- **THEN** the words are no longer a link
