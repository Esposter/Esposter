## ADDED Requirements

### Requirement: The email critique reports a button or navbar link with no address or text

The email critique SHALL report each button and navbar link whose address or text is empty, naming its node.

#### Scenario: A button with no address is reported

- **GIVEN** an email holding a button with a label and no address
- **WHEN** the owner opens the problems surface
- **THEN** the surface lists a warning naming the button

#### Scenario: A navbar link with no text is reported

- **GIVEN** an email holding a navbar link with an address and no text
- **WHEN** the owner opens the problems surface
- **THEN** the surface lists a warning naming the navbar link

#### Scenario: A button with an address and a label is not reported

- **GIVEN** an email holding a button with an address and a label
- **WHEN** the owner opens the problems surface
- **THEN** no finding names the button

### Requirement: The email critique reports a heading that skips a level or is empty

The email critique SHALL report each heading that is empty or sits more than one level below the heading before it in the email, naming the text block that holds it.

#### Scenario: A heading two levels below the one before it is reported

- **GIVEN** an email whose first text block holds a level 1 heading and whose next text block holds a level 3 heading
- **WHEN** the owner opens the problems surface
- **THEN** the surface lists a warning naming the second text block

#### Scenario: A heading one level below the one before it is not reported

- **GIVEN** an email whose first text block holds a level 1 heading and whose next text block holds a level 2 heading
- **WHEN** the owner opens the problems surface
- **THEN** no finding names the second text block

#### Scenario: An empty heading is reported

- **GIVEN** an email holding a heading with no text
- **WHEN** the owner opens the problems surface
- **THEN** the surface lists a warning naming the text block that holds it

### Requirement: The email critique reports text below the contrast threshold

The email critique SHALL report each text whose contrast with its background is below 4.5 to 1, naming its node, and SHALL report a text whose colours it cannot read as unchecked.

#### Scenario: Low-contrast text is reported with its node

- **GIVEN** an email with a text in light grey on a white background
- **WHEN** the owner opens the problems surface
- **THEN** the surface lists a warning naming that text block

#### Scenario: Text at exactly 4.5 to 1 is not reported

- **GIVEN** a text whose contrast with its background is exactly 4.5 to 1
- **WHEN** the owner opens the problems surface
- **THEN** no finding names that text block

#### Scenario: Text is checked against its column background

- **GIVEN** a light text inside a column whose background is dark
- **WHEN** the owner opens the problems surface
- **THEN** the text is checked against the column's dark background
- **AND** no finding names that text block

#### Scenario: A colour the editor cannot read is reported unchecked

- **GIVEN** a text whose colour is a value the editor cannot read
- **WHEN** the owner opens the problems surface
- **THEN** the surface lists that text block as unchecked
- **AND** the text is not reported as passing its contrast check

### Requirement: The email's findings are warnings in the problems surface

The email critique's findings SHALL be listed in the problems surface as warnings, and a warning SHALL NOT refuse a save.

#### Scenario: A link finding is a warning in the problems surface

- **GIVEN** an email holding a button with no address
- **WHEN** the owner opens the problems surface
- **THEN** the surface lists the button as a warning

#### Scenario: The findings follow an unsaved edit

- **GIVEN** an email open in the editor with a button that has an address and a label
- **WHEN** the owner clears the button's address without saving
- **THEN** the problems surface lists a warning naming the button

#### Scenario: A critique warning does not refuse an email save

- **GIVEN** an email whose only finding is a critique warning
- **WHEN** the owner saves the email
- **THEN** the save lands

### Requirement: Choosing an email finding selects the node it names

Choosing an email finding SHALL select the node it names on the canvas.

#### Scenario: Choosing an email finding selects its node

- **GIVEN** the problems surface lists a warning naming a button
- **WHEN** the owner chooses that warning
- **THEN** the button is selected on the canvas

### Requirement: An agent reads the email critique of a saved email

The read tool SHALL answer the critique of a saved email at the content version it was read at, to a key holding the Resources scope.

#### Scenario: An agent read reports a link finding of a saved email

- **GIVEN** a key holding the Resources scope and a saved email with a button that has no address
- **WHEN** the agent reads the critique of that email
- **THEN** the answer lists the button with its node
- **AND** the answer carries the content version it was read at

#### Scenario: An agent read reports email colour checks as unchecked

- **GIVEN** a key holding the Resources scope and a saved email with a text whose colour is set and is low in contrast
- **WHEN** the agent reads the critique of that email
- **THEN** the answer lists that text as unchecked
- **AND** the answer does not list that text as low contrast

#### Scenario: A resource the key does not own is refused for an email

- **GIVEN** a key holding the Resources scope and an email that belongs to another owner
- **WHEN** the agent reads the critique of that email
- **THEN** the read is refused as if the resource did not exist
