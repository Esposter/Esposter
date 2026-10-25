## MODIFIED Requirements

### Requirement: A save refused as out of date tells the owner to refresh

When a save is refused because the resource was modified elsewhere, the owner SHALL be told the resource was modified elsewhere and offered a refresh that reloads the latest version.

Decided in the live-edits change, so the stale-save requirement keeps its refresh: the choice between taking the other version and keeping the local edit is offered when the other save lands while an edit is unsaved, at once, under the live-edits capability. A refused save names no other save, so there is no other version to choose between and no device to name; the refresh is its only answer. A refusal is the one case the save stream did not deliver, so it stays the fallback and is not a second route to the choice.

#### Scenario: Save from a stale tab

- **GIVEN** the same resource is open in two tabs
- **AND** one tab saved a newer version
- **WHEN** the other tab saves its older version
- **THEN** that tab shows a warning that the resource was modified elsewhere
- **AND** the warning offers a Refresh action that loads the latest version
