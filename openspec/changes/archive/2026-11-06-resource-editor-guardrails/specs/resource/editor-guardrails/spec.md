## ADDED Requirements

### Requirement: An insertion menu offers only what the slot accepts

A guided editor's insertion menu SHALL list the kinds the slot at the insertion point accepts, and no kind it does not accept.

#### Scenario: An insertion menu offers only the kinds the slot accepts

- **GIVEN** an insertion point inside an email column
- **WHEN** the insertion menu is opened
- **THEN** it lists the content kinds a column accepts
- **AND** it does not list a section

#### Scenario: A kind no slot accepts here is absent

- **GIVEN** an insertion point whose slot accepts one kind
- **WHEN** the insertion menu is opened
- **THEN** only that kind is listed

### Requirement: An action the selection cannot take says why

A guided editor SHALL show an action that is valid elsewhere but not at the selection as disabled, with the reason the command would refuse it.

#### Scenario: An action the selection cannot take says why

- **GIVEN** the last element of a page selected
- **WHEN** the move down action is shown
- **THEN** it is disabled
- **AND** its reason says the element is last

### Requirement: The problems surface lists every finding with its node

The problems surface SHALL list every finding of the editor's check, each with its message and the title of the node it concerns, and SHALL show the count of them in the top bar, none when there are none.

#### Scenario: The problems surface lists each finding with its node

- **GIVEN** a survey in which two questions share a name
- **WHEN** the problems surface is opened
- **THEN** it lists the clash against each of the two questions

#### Scenario: A document with no findings shows no count

- **GIVEN** a document the check finds nothing in
- **WHEN** the top bar is drawn
- **THEN** no count is shown

### Requirement: Choosing a finding selects its node

Choosing a finding SHALL select the node it concerns and scroll it into view.

#### Scenario: Choosing a finding selects its node

- **GIVEN** a finding that concerns a question below the fold
- **WHEN** the reader chooses it
- **THEN** that question is selected
- **AND** it is scrolled into view

### Requirement: The findings follow the document

An editor's findings SHALL be recomputed after an edit settles, so a fix removes its finding and an edit that breaks a rule adds one.

#### Scenario: A fix removes its finding

- **GIVEN** a survey with a name clash
- **WHEN** one of the two questions is renamed
- **THEN** the clash is no longer listed

### Requirement: A refused save leaves the findings in view

A save the editor's check refuses SHALL keep the reader's edit and keep the findings in the problems surface with the editor reading not saved, until the findings clear.

#### Scenario: A refused save leaves the findings in view

- **GIVEN** a survey with an error finding
- **WHEN** a save is attempted
- **THEN** nothing is saved and the edit is kept
- **AND** the problems surface shows the finding and the editor reads not saved

### Requirement: A warning does not refuse a save

A finding of warning severity SHALL NOT refuse a save, and only an error SHALL.

#### Scenario: A warning does not refuse a save

- **GIVEN** a webpage with only a contrast warning
- **WHEN** a save is attempted
- **THEN** the save lands
- **AND** the warning stays listed

### Requirement: An email's validator messages are findings

An email's validator messages SHALL become findings of the severity the validator gives each one, and only an error SHALL refuse a save.

#### Scenario: A validator message becomes a finding

- **GIVEN** an email whose validator reports one error and one warning
- **WHEN** Design is drawn
- **THEN** the error is listed as an error finding and the warning as a warning finding
- **AND** a save is refused only while the error stands
