## RENAMED Requirements

- FROM: `### Requirement: A save refused as out of date tells the owner to refresh`
- TO: `### Requirement: A save refused as out of date offers a choice`

## MODIFIED Requirements

### Requirement: A save refused as out of date offers a choice

When a save is refused because the resource was modified elsewhere, the owner SHALL be told the resource was modified elsewhere and offered a choice between taking the other version and keeping the local edit.

#### Scenario: Save from a stale tab

- **GIVEN** the same resource is open in two tabs
- **AND** one tab saved a newer version
- **WHEN** the other tab saves its older version
- **THEN** that tab shows a notice that the resource was modified elsewhere
- **AND** the notice offers a choice between taking the other version and keeping mine
