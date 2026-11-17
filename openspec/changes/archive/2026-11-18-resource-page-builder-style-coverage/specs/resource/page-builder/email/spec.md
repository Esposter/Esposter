## ADDED Requirements

### Requirement: An email node's style fields are grouped into sectors

An email node's style fields SHALL be grouped into the sectors the webpage's style panel uses, with each field in one sector, and a field no sector names SHALL be grouped under Other.

#### Scenario: A text's fields are grouped by sector

- **GIVEN** a text node in an email
- **WHEN** the owner opens its style fields
- **THEN** the Typography sector holds its font family, font size and colour
- **AND** the Spacing sector holds its padding fields

#### Scenario: A sector with no field for the node is not drawn

- **GIVEN** a button in an email
- **WHEN** the owner opens its style fields
- **THEN** no Position sector is drawn

#### Scenario: A field no sector names is grouped under Other

- **GIVEN** a button in an email with an address
- **WHEN** the owner opens its style fields
- **THEN** the Other sector holds its address field
