## ADDED Requirements

### Requirement: A tag box whose minimum is above its maximum is refused on save

A save of a tag box whose minimum selection is above its maximum SHALL be refused, naming the minimum. A checkbox already holds this refusal, so it is not repeated here.

#### Scenario: A tag box whose minimum is above its maximum is refused on save

- **GIVEN** a tag box whose minimum selection is three and whose maximum is two
- **WHEN** the owner saves the survey
- **THEN** the save is refused
- **AND** the refusal names the tag box's minimum
