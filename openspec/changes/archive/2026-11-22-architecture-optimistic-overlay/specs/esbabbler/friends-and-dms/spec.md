## ADDED Requirements

### Requirement: A removed friendship or request stays a tombstone that a stale answer cannot restore

A removed friendship or request SHALL stay on the client as a tombstone, so a read or a write answer that was taken before the removal cannot bring the removed friend or request back.

#### Scenario: A read answered before a removal does not bring the removed friend back

- **GIVEN** a read of the friend list that is answered after the reader removes a friend
- **WHEN** the read's answer arrives
- **THEN** the removed friend does not appear in the list

#### Scenario: A rejected unfriend does not bring back a friend a block removed

- **GIVEN** a friend whose friendship a block removed while the unfriend was in flight
- **WHEN** the server refuses the unfriend
- **THEN** the friend stays off the list

### Requirement: A refused friend action drops only its own change

A refused friend action SHALL drop only the change it made, so every other removal the reader made stays off the list.

#### Scenario: A refused removal keeps only the friend whose removal was refused

- **GIVEN** two friends the reader removes at once
- **WHEN** the server refuses the removal of one of them
- **THEN** only that friend returns to the list

#### Scenario: A refused decline keeps only the request whose decline was refused

- **GIVEN** two friend requests the reader declines at once
- **WHEN** the server refuses the decline of one of them
- **THEN** only that request returns to the list
