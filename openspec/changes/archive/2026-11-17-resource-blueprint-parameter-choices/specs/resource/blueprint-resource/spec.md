## ADDED Requirements

### Requirement: A parameter can list the values it accepts

A blueprint parameter SHALL take an optional list of allowed values, its default SHALL be one of them, and a deploy SHALL refuse a value that is not in the list before it creates anything.

#### Scenario: A value in the list deploys

- **GIVEN** a blueprint whose region parameter allows North and South
- **WHEN** the owner deploys it with the value North
- **THEN** the deploy creates its resources with North in their names

#### Scenario: A value outside the list is refused and nothing is created

- **GIVEN** a blueprint whose region parameter allows North and South
- **WHEN** a deploy is requested with the value East
- **THEN** the deploy is refused
- **AND** no resource is created

#### Scenario: A default outside the list is refused

- **GIVEN** a manifest whose region parameter allows North and South and defaults to East
- **WHEN** the owner saves the blueprint
- **THEN** the save is refused

#### Scenario: A parameter with no list stays free text

- **GIVEN** a parameter with no allowed values
- **WHEN** the owner deploys the blueprint with any text for it
- **THEN** the deploy accepts the text

#### Scenario: The dialog offers a listed parameter as a choice

- **GIVEN** a blueprint whose region parameter allows North and South and defaults to North
- **WHEN** the owner opens the Deploy dialog
- **THEN** the region is a choice between North and South
- **AND** North is selected
