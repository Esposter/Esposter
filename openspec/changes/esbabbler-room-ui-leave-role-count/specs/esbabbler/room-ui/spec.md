## ADDED Requirements

### Requirement: A departure keeps every role group count exact

A member's departure SHALL leave each role group's count equal to the members holding that role and the roleless count non-negative, whether or not the member's roles were loaded.

#### Scenario: a leave from an unloaded page keeps every group count equal to its members

- **GIVEN** a room of 300 members who all hold the Admin role, with only the first 50 members' roles loaded
- **WHEN** a member outside the loaded pages leaves
- **THEN** the Admin group count is 299
- **AND** the roleless count is 0
