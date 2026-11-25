## REMOVED Requirements

### Requirement: Out of date stays until the resource is reloaded

**Reason**: A save refused as stale now opens the Take theirs or Keep mine notice, so the person resolves it in place rather than by a reload that drops their edit.

**Migration**: None; the notice that another device's save already raised is the one shown.

## ADDED Requirements

### Requirement: Out of date stays until a version is chosen

A resource whose save was refused as out of date, or whose unsaved edit met another writer's save, SHALL show Out of date until the person takes the other version or keeps their own.

#### Scenario: Taking theirs replaces the unsaved edit

- **GIVEN** an unsaved edit met another device's save
- **WHEN** the person takes the other version
- **THEN** the save state reads Saved
