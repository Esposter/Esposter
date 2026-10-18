## MODIFIED Requirements

### Requirement: A defeated camp member returns only after its camp's respawn time

A defeated enemy SHALL NOT return before its respawn time, which depends on its camp: twelve hours for a camp of common enemies, the next daily reset for a camp with an elite, and on the next load for a camp with a boss.

#### Scenario: A common camp member returns twelve hours after its defeat

- **GIVEN** a camp of common enemies with a member defeated
- **WHEN** twelve hours pass
- **THEN** the member returns

#### Scenario: An elite camp member returns at the next daily reset

- **GIVEN** a camp with an elite and a member defeated
- **WHEN** the next daily reset at 04:00 on the server's clock arrives
- **THEN** the member returns

#### Scenario: A boss camp returns on the next load with its reward claimed

- **GIVEN** a camp with a boss whose reward is claimed
- **WHEN** the page is next loaded
- **THEN** the boss's camp is spawned again
