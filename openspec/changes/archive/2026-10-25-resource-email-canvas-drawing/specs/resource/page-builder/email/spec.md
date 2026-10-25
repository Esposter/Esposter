## ADDED Requirements

### Requirement: Each email part is drawn with its own content

The design canvas SHALL draw each part of an email with the words or parts its content gives it, and SHALL NOT draw a part as a box labelled only with its type name, except a part whose content the canvas cannot show, such as a social row.

#### Scenario: a button draws its own words

- **GIVEN** a button in an email reading "Get started"
- **WHEN** the owner views the design canvas
- **THEN** the button shows "Get started"
- **AND** the button does not show its type name

#### Scenario: a navbar draws each link as its own words in a row

- **GIVEN** a navbar in an email with the links Home and Features
- **WHEN** the owner views the design canvas
- **THEN** Home and Features are shown side by side as their own words

#### Scenario: the starter email draws every part with its content

- **GIVEN** the starter email a new email begins from
- **WHEN** the owner views the design canvas
- **THEN** each part of the starter shows its own content
- **AND** no part shows only its type name, except a social row, which keeps its labelled box

#### Scenario: every email part has a drawing

- **GIVEN** each part type an email can hold
- **WHEN** the design canvas draws an email holding one of each
- **THEN** each part is drawn with a drawing chosen for its type
