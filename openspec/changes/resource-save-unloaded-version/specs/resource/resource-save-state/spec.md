## ADDED Requirements

### Requirement: A save of a resource no longer open is refused when another device moved its content on

A content save of a resource the owner has navigated away from SHALL carry the version its own content was confirmed at, so the server refuses it when another device has saved newer content since.

#### Scenario: A queued save of a closed resource is refused after another device saved

- **GIVEN** a resource open at content version 3 with an autosave queued behind an in-flight save of it
- **WHEN** the owner navigates away and another device saves the resource at version 4
- **THEN** the queued save is sent at version 3 and the server refuses it as stale
- **AND** the stale notice is shown for the resource

#### Scenario: A row read from another device does not raise the version a save carries

- **GIVEN** a resource no longer open whose row is read at version 4 from another device
- **WHEN** a save of its content issued at version 3 is sent
- **THEN** the save carries version 3, not 4
