## ADDED Requirements

### Requirement: The critique reports text below the normal-text contrast threshold

The critique SHALL report each text whose contrast with its effective background is below 4.5 to 1, naming the text's node.

#### Scenario: low-contrast text is reported with its node

- **GIVEN** a webpage with a text in light grey on a white page
- **WHEN** the owner opens the Check panel
- **THEN** the panel lists a finding naming that text's node

#### Scenario: text at exactly 4.5 to 1 is not reported

- **GIVEN** a text whose contrast with its background is exactly 4.5 to 1
- **WHEN** the owner opens the Check panel
- **THEN** no finding names that text

#### Scenario: text is checked against the background its section sets

- **GIVEN** a light text inside a section whose background is dark
- **WHEN** the owner opens the Check panel
- **THEN** the text is checked against the section's dark background, not the page's white

### Requirement: A colour the critique cannot read is reported unchecked

The critique SHALL report a text whose colour or background it cannot read as unchecked, never as passing.

#### Scenario: an unreadable colour is reported unchecked

- **GIVEN** a text whose colour is a value the critique cannot read
- **WHEN** the owner opens the Check panel
- **THEN** the panel lists that text as unchecked
- **AND** the panel does not report the page as passing its contrast checks

### Requirement: The critique reports a fixed width wider than a phone

The critique SHALL report a node whose fixed width is wider than the narrowest device the canvas draws, when no mobile override narrows it.

#### Scenario: a fixed width with no mobile override is reported

- **GIVEN** a node fixed at 800 pixels wide with no mobile override
- **WHEN** the owner opens the Check panel
- **THEN** the panel lists a finding naming that node

#### Scenario: a mobile override that narrows the node is not reported

- **GIVEN** a node fixed at 800 pixels wide, with a mobile override of 320 pixels
- **WHEN** the owner opens the Check panel
- **THEN** no finding names that node

### Requirement: The critique reports a survey invite to an unpublished survey

The critique SHALL report each survey invite whose survey has no published version, naming the invite's node.

#### Scenario: an invite to an unpublished survey is reported

- **GIVEN** a webpage with a survey invite to a survey that has never been published
- **WHEN** the owner opens the Check panel
- **THEN** the panel lists a finding naming the invite's node

#### Scenario: a survey lookup that fails leaves the invite unchecked

- **GIVEN** a webpage with a survey invite whose survey lookup fails
- **WHEN** the owner opens the Check panel
- **THEN** the panel lists that invite as unchecked
- **AND** the invite is not dropped from the findings

### Requirement: The Check panel reflects the open document as it is edited

The Check panel SHALL list the findings of the open document, including unsaved edits, and SHALL update as the owner edits.

#### Scenario: an unsaved edit changes the findings

- **GIVEN** a webpage open in the editor with no finding for a text
- **WHEN** the owner changes that text's colour to a low-contrast one without saving
- **THEN** the Check panel lists a finding naming that text

### Requirement: Selecting a finding selects its node on the canvas

The Check panel SHALL select the node a finding names on the canvas when the owner chooses that finding.

#### Scenario: choosing a finding selects its node

- **GIVEN** the Check panel listing a finding for a node
- **WHEN** the owner chooses that finding
- **THEN** the canvas selects that node

### Requirement: An agent reads the critique of a saved resource

The read tool SHALL answer the critique of the saved content of a resource the key owns, at the content version it was read at, to a key holding the Resources scope.

#### Scenario: an agent reads the critique of a saved webpage

- **GIVEN** a key holding the Resources scope and a saved webpage with one finding
- **WHEN** the agent reads the critique of that webpage
- **THEN** the answer lists the one finding with its node
- **AND** the answer carries the content version it was read at

#### Scenario: a type without a critique is refused, naming the type

- **GIVEN** a key holding the Resources scope and a saved resource of a type with no critique
- **WHEN** the agent reads the critique of that resource
- **THEN** the read is refused, naming the type

#### Scenario: a resource the key does not own is refused

- **GIVEN** a key holding the Resources scope and a webpage that belongs to another owner
- **WHEN** the agent reads the critique of that webpage
- **THEN** the read is refused as if the resource did not exist
